import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { FileStorageService } from '../services/cloudinary.service';
import { AIService } from '../services/openai.service';
import { TimetableService } from '../services/timetable.service';
import { AuditService } from '../services/audit.service';
import { Role, LeaveStatus, LeaveCategory, NotificationType, DocumentStatus, CondonationStatus } from '../types';

export class LeaveController {
  static async apply(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'STUDENT') {
        return res.status(403).json({ message: 'Only students can apply for medical leave.' });
      }

      const {
        startDate,
        endDate,
        reason,
        category,
        isProxy,
        proxyName,
        proxyRelationship,
        startOption, // 'FULL' or 'AFTERNOON'
        endOption    // 'FULL' or 'MORNING'
      } = req.body;

      if (!startDate || !endDate || !reason || !category) {
        return res.status(400).json({ message: 'Start date, end date, reason, and category are required.' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'Medical certificate document upload is required.' });
      }

      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);

      if (parsedStartDate > parsedEndDate) {
        return res.status(400).json({ message: 'Start date cannot be after end date.' });
      }

      // Fetch student profile details
      const student = await prisma.student.findUnique({
        where: { userId: req.user.id },
        include: { user: true }
      });

      if (!student) {
        return res.status(404).json({ message: 'Student profile not found.' });
      }

      // 1. Upload medical certificate to file storage
      const storageResult = await FileStorageService.uploadFile(req.file.path, req.file.originalname);

      // 2. Set SLA Deadlines
      const now = new Date();
      // Health Center has 24h
      const healthCentreDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // 3. Create Leave Application
      const application = await prisma.leaveApplication.create({
        data: {
          studentId: student.id,
          startDate: parsedStartDate,
          endDate: parsedEndDate,
          reason,
          category: category as LeaveCategory,
          isProxy: isProxy === 'true' || isProxy === true,
          proxyName: proxyName || null,
          proxyRelationship: proxyRelationship || null,
          status: 'PENDING_HEALTH_CENTRE',
          currentApproverRole: 'MED_OFFICER',
          healthCentreDeadline,
          documents: {
            create: {
              fileUrl: storageResult.url,
              fileType: req.file.mimetype.split('/')[1].toUpperCase(),
              originalName: req.file.originalname
            }
          }
        },
        include: {
          documents: true
        }
      });

      const document = application.documents[0];

      // 4. Calculate and generate missed classes
      const missedClassesPayloads = await TimetableService.calculateMissedClasses(
        student.id,
        parsedStartDate,
        parsedEndDate,
        { startOption, endOption }
      );

      if (missedClassesPayloads.length > 0) {
        await prisma.missedClass.createMany({
          data: missedClassesPayloads.map((mc) => ({
            leaveApplicationId: application.id,
            courseId: mc.courseId,
            date: mc.date,
            slotId: mc.slotId,
            slotName: mc.slotName,
            isPartial: mc.isPartial,
            status: 'PENDING'
          }))
        });
      }

      // 5. Trigger AI Analysis asynchronously
      AIService.analyzeCertificate(storageResult.url, student.user.name)
        .then(async (aiResult) => {
          await prisma.aIAnalysis.create({
            data: {
              medicalDocumentId: document.id,
              patientName: aiResult.patientName,
              doctorName: aiResult.doctorName,
              hospitalName: aiResult.hospitalName,
              diagnosis: aiResult.diagnosis,
              restDays: aiResult.restDays,
              confidenceScore: aiResult.confidenceScore,
              autoSummary: aiResult.autoSummary,
              status: aiResult.status,
              fraudAlerts: JSON.stringify(aiResult.fraudAlerts)
            }
          });

          // Log AI Analysis result
          console.log(`[LeaveController] AI analysis completed for leave ${application.id}. Status: ${aiResult.status}`);
          
          // If suspicious, create a system notification for the doctor
          if (aiResult.status === 'SUSPICIOUS') {
            const doctors = await prisma.user.findMany({ where: { role: 'MED_OFFICER' } });
            for (const doc of doctors) {
              await prisma.notification.create({
                data: {
                  userId: doc.id,
                  message: `ALERT: AI flagged uploaded certificate for ${student.user.name} (${student.rollNumber}) as suspicious (Confidence: ${aiResult.confidenceScore}).`,
                  type: 'ESCALATION'
                }
              });
            }
          }
        })
        .catch((err) => {
          console.error('[LeaveController] Background AI Analysis failed:', err);
        });

      // 6. Notify Medical Officer
      const doctors = await prisma.user.findMany({ where: { role: 'MED_OFFICER' } });
      for (const doc of doctors) {
        await prisma.notification.create({
          data: {
            userId: doc.id,
            message: `New leave verification request submitted by student ${student.user.name} (${student.rollNumber}).`,
            type: 'APPROVAL_REQUEST'
          }
        });
      }

      // Notify HOD of student's department (Notifications only, no approval role)
      const departmentHods = await prisma.faculty.findMany({
        where: { departmentId: student.departmentId, isHOD: true },
        include: { user: true }
      });
      for (const hod of departmentHods) {
        await prisma.notification.create({
          data: {
            userId: hod.user.id,
            message: `Notification: Student ${student.user.name} (${student.rollNumber}) has submitted a medical leave request (${parsedStartDate.toLocaleDateString()} to ${parsedEndDate.toLocaleDateString()}).`,
            type: 'DECISION'
          }
        });
      }

      // 7. Write Audit Log
      await AuditService.log({
        userId: student.userId,
        action: 'SUBMIT_LEAVE_APPLICATION',
        details: {
          leaveApplicationId: application.id,
          startDate: parsedStartDate,
          endDate: parsedEndDate,
          isProxy: application.isProxy,
          missedClassesCount: missedClassesPayloads.length
        }
      });

      res.status(201).json({
        message: 'Leave application submitted successfully. AI analysis has been triggered in the background.',
        application
      });
    } catch (error) {
      console.error('Submit leave application error:', error);
      res.status(500).json({ message: 'Failed to submit leave application. Please try again.' });
    }
  }

  static async list(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized.' });

      const role = req.user.role;
      let leaves = [];

      if (role === 'STUDENT') {
        // Fetch student leaves
        const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
        if (!student) return res.status(404).json({ message: 'Student profile not found.' });

        leaves = await prisma.leaveApplication.findMany({
          where: { studentId: student.id },
          include: {
            documents: { include: { aiAnalysis: true } },
            missedClasses: { include: { course: true } }
          },
          orderBy: { createdAt: 'desc' }
        });
      } else if (role === 'MED_OFFICER') {
        // List pending or all leaves for Health Centre
        leaves = await prisma.leaveApplication.findMany({
          include: {
            student: { include: { user: true, department: true } },
            documents: { include: { aiAnalysis: true } }
          },
          orderBy: { createdAt: 'desc' }
        });
      } else if (role === 'WARDEN') {
        // List only residential student leaves matching the warden's hostel
        const warden = await prisma.warden.findUnique({ where: { userId: req.user.id } });
        if (!warden) return res.status(404).json({ message: 'Warden profile not found.' });

        leaves = await prisma.leaveApplication.findMany({
          where: {
            student: {
              isResidential: true,
              hostelName: warden.hostelName
            }
          },
          include: {
            student: { include: { user: true, department: true } },
            documents: { include: { aiAnalysis: true } }
          },
          orderBy: { createdAt: 'desc' }
        });
      } else if (role === 'FACULTY' || role === 'HOD') {
        // List leaves matching department
        const faculty = await prisma.faculty.findUnique({ where: { userId: req.user.id } });
        if (!faculty) return res.status(404).json({ message: 'Faculty profile not found.' });

        leaves = await prisma.leaveApplication.findMany({
          where: {
            student: {
              departmentId: faculty.departmentId
            }
          },
          include: {
            student: { include: { user: true, department: true } },
            documents: { include: { aiAnalysis: true } }
          },
          orderBy: { createdAt: 'desc' }
        });
      } else {
        // Admins can see everything
        leaves = await prisma.leaveApplication.findMany({
          include: {
            student: { include: { user: true, department: true } },
            documents: { include: { aiAnalysis: true } }
          },
          orderBy: { createdAt: 'desc' }
        });
      }

      res.json(leaves);
    } catch (error) {
      console.error('List leave applications error:', error);
      res.status(500).json({ message: 'Failed to retrieve leave applications.' });
    }
  }

  static async getDetails(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const leave = await prisma.leaveApplication.findUnique({
        where: { id },
        include: {
          student: {
            include: {
              user: true,
              department: true
            }
          },
          documents: {
            include: {
              aiAnalysis: true
            }
          },
          comments: {
            include: {
              user: true
            },
            orderBy: {
              createdAt: 'asc'
            }
          },
          missedClasses: {
            include: {
              course: true,
              faculty: { include: { user: true } }
            }
          }
        }
      });

      if (!leave) {
        return res.status(404).json({ message: 'Leave application not found.' });
      }

      res.json(leave);
    } catch (error) {
      console.error('Get leave details error:', error);
      res.status(500).json({ message: 'Failed to retrieve application details.' });
    }
  }

  static async review(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { action, remarks } = req.body; // action: 'APPROVE', 'REJECT', 'CLARIFY'

      if (!action || !['APPROVE', 'REJECT', 'CLARIFY'].includes(action)) {
        return res.status(400).json({ message: 'Valid action is required: APPROVE, REJECT, CLARIFY.' });
      }

      if (!req.user) return res.status(401).json({ message: 'Unauthorized.' });

      const leave = await prisma.leaveApplication.findUnique({
        where: { id },
        include: { student: { include: { user: true } } }
      });

      if (!leave) return res.status(404).json({ message: 'Leave application not found.' });

      const currentRole = req.user.role;
      const now = new Date();
      let updatedStatus: LeaveStatus = leave.status as LeaveStatus;
      let nextApproverRole: Role = leave.currentApproverRole as Role;

      // Verification checks depending on current level
      if (leave.status === 'PENDING_HEALTH_CENTRE' && currentRole === 'MED_OFFICER') {
        if (action === 'APPROVE') {
          // Progress to Warden if residential, else Faculty
          nextApproverRole = leave.student.isResidential ? 'WARDEN' : 'FACULTY';
          updatedStatus = leave.student.isResidential ? 'PENDING_WARDEN' : 'PENDING_FACULTY';
          
          await prisma.leaveApplication.update({
            where: { id },
            data: {
              healthCentreApproved: true,
              healthCentreDeadline: null, // cleared
              // Set next deadline (24 hours for warden or 48 for faculty)
              wardenDeadline: leave.student.isResidential ? new Date(now.getTime() + 24 * 60 * 60 * 1000) : null,
              facultyDeadline: !leave.student.isResidential ? new Date(now.getTime() + 48 * 60 * 60 * 1000) : null
            }
          });
        } else if (action === 'REJECT') {
          updatedStatus = 'REJECTED';
        } else {
          updatedStatus = 'CLARIFICATION_REQUESTED';
        }
      } else if (leave.status === 'PENDING_WARDEN' && currentRole === 'WARDEN') {
        if (action === 'APPROVE') {
          nextApproverRole = 'FACULTY';
          updatedStatus = 'PENDING_FACULTY';
          
          await prisma.leaveApplication.update({
            where: { id },
            data: {
              wardenApproved: true,
              wardenDeadline: null,
              facultyDeadline: new Date(now.getTime() + 48 * 60 * 60 * 1000)
            }
          });
        } else if (action === 'REJECT') {
          updatedStatus = 'REJECTED';
        } else {
          updatedStatus = 'CLARIFICATION_REQUESTED';
        }
      } else if (leave.status === 'PENDING_FACULTY' && currentRole === 'FACULTY') {
        if (action === 'APPROVE') {
          // Fully approved!
          nextApproverRole = 'FACULTY';
          updatedStatus = 'APPROVED';
          
          await prisma.leaveApplication.update({
            where: { id },
            data: {
              facultyApproved: true,
              facultyDeadline: null
            }
          });

          // Auto-condone all missed classes for this leave application with one click!
          const facultyProfile = await prisma.faculty.findUnique({
            where: { userId: req.user.id }
          });
          
          await prisma.missedClass.updateMany({
            where: { leaveApplicationId: id, status: 'PENDING' },
            data: {
              status: 'CONDONED',
              facultyId: facultyProfile?.id || null,
              condonedAt: new Date()
            }
          });
        } else if (action === 'REJECT') {
          updatedStatus = 'REJECTED';
        } else {
          updatedStatus = 'CLARIFICATION_REQUESTED';
        }
      } else if (leave.status === 'CLARIFICATION_REQUESTED' && currentRole === 'STUDENT' && action === 'APPROVE') {
        // Student re-submits documentation or clarification
        nextApproverRole = 'MED_OFFICER';
        updatedStatus = 'PENDING_HEALTH_CENTRE';
      } else {
        return res.status(403).json({
          message: `You are not authorized to perform action '${action}' at current state '${leave.status}' with role '${currentRole}'.`
        });
      }

      // Update the leave application status
      const updatedLeave = await prisma.leaveApplication.update({
        where: { id },
        data: {
          status: updatedStatus,
          currentApproverRole: nextApproverRole,
          remarks: remarks ? `${currentRole}: ${remarks}` : leave.remarks
        }
      });

      // Audit Log
      await AuditService.log({
        userId: req.user.id,
        action: `${action}_LEAVE_APPLICATION`,
        details: { leaveApplicationId: id, role: currentRole, status: updatedStatus, remarks }
      });

      // Create Notification for student
      await prisma.notification.create({
        data: {
          userId: leave.student.userId,
          message: `Your leave application status has been updated to: ${updatedStatus.replace(/_/g, ' ')} (${remarks || 'No remarks'}).`,
          type: action === 'CLARIFY' ? 'CLARIFICATION' : 'DECISION'
        }
      });

      // If fully approved, trigger HOD notifications and condoned log entries
      if (updatedStatus === 'APPROVED') {
        // Notify HOD of the student's department about final approval
        const studentProfileForNotification = await prisma.student.findUnique({
          where: { id: leave.studentId }
        });
        if (studentProfileForNotification) {
          const departmentHods = await prisma.faculty.findMany({
            where: { departmentId: studentProfileForNotification.departmentId, isHOD: true },
            include: { user: true }
          });
          for (const hod of departmentHods) {
            await prisma.notification.create({
              data: {
                userId: hod.user.id,
                message: `Notification: Medical leave for student ${leave.student.user.name} (${leave.student.rollNumber}) has been FULLY APPROVED.`,
                type: 'DECISION'
              }
            });
          }
        }
        await this.triggerCondonationNotifications(id);
      } else if (updatedStatus === 'PENDING_WARDEN' || updatedStatus === 'PENDING_FACULTY') {
        // Notify the next reviewer role
        const approverUsers = await prisma.user.findMany({ where: { role: nextApproverRole } });
        for (const appUser of approverUsers) {
          await prisma.notification.create({
            data: {
              userId: appUser.id,
              message: `Approval Required: Medical leave application for ${leave.student.user.name} is waiting for your review.`,
              type: 'APPROVAL_REQUEST'
            }
          });
        }
      }

      res.json({ message: `Application ${action.toLowerCase()}d successfully.`, application: updatedLeave });
    } catch (error) {
      console.error('Review leave application error:', error);
      res.status(500).json({ message: 'Failed to update leave application review.' });
    }
  }

  static async addComment(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params; // leave ID
      const { content } = req.body;

      if (!content || content.trim() === '') {
        return res.status(400).json({ message: 'Comment content cannot be empty.' });
      }

      if (!req.user) return res.status(401).json({ message: 'Unauthorized.' });

      const leave = await prisma.leaveApplication.findUnique({
        where: { id },
        include: { student: true }
      });

      if (!leave) return res.status(404).json({ message: 'Leave application not found.' });

      const comment = await prisma.comment.create({
        data: {
          leaveApplicationId: id,
          userId: req.user.id,
          content
        },
        include: {
          user: true
        }
      });

      const isStudent = req.user.role === 'STUDENT';
      
      // Let's notify student if comment is from staff
      if (!isStudent) {
        await prisma.notification.create({
          data: {
            userId: leave.student.userId,
            message: `${req.user.name} added a comment to your leave application: "${content.substring(0, 40)}..."`,
            type: 'COMMENT'
          }
        });
      } else {
        // Notify current approver
        const approverUsers = await prisma.user.findMany({ where: { role: leave.currentApproverRole } });
        for (const appUser of approverUsers) {
          await prisma.notification.create({
            data: {
              userId: appUser.id,
              message: `Comment from Student ${req.user.name} on application: "${content.substring(0, 40)}..."`,
              type: 'COMMENT'
            }
          });
        }
      }

      res.status(201).json(comment);
    } catch (error) {
      console.error('Add comment error:', error);
      res.status(500).json({ message: 'Failed to add comment.' });
    }
  }

  static async downloadReport(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const leave = await prisma.leaveApplication.findUnique({
        where: { id },
        include: {
          student: { include: { user: true, department: true } },
          missedClasses: { include: { course: true } },
          documents: { include: { aiAnalysis: true } }
        }
      });

      if (!leave) return res.status(404).json({ message: 'Leave application not found.' });

      const dateRange = `${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}`;
      const statusStr = leave.status.replace(/_/g, ' ');
      
      const report = {
        title: 'Jaypee University of Information Technology - Condonation Report',
        studentName: leave.student.user.name,
        rollNumber: leave.student.rollNumber,
        department: leave.student.department.name,
        hostel: leave.student.isResidential ? leave.student.hostelName : 'Day Scholar',
        dateRange,
        illnessCategory: leave.category,
        reason: leave.reason,
        status: statusStr,
        healthCentreStatus: leave.healthCentreApproved ? 'VERIFIED' : 'PENDING/BYPASSED',
        wardenStatus: leave.student.isResidential ? (leave.wardenApproved ? 'APPROVED' : 'PENDING') : 'N/A',
        facultyStatus: leave.facultyApproved ? 'APPROVED' : 'PENDING',
        approvalRemarks: leave.remarks || 'No remarks',
        missedClasses: leave.missedClasses.map((mc) => ({
          courseCode: mc.course.code,
          courseName: mc.course.name,
          date: mc.date.toDateString(),
          slot: mc.slotName,
          status: mc.status
        }))
      };

      res.json(report);
    } catch (error) {
      console.error('Download report error:', error);
      res.status(500).json({ message: 'Failed to generate report.' });
    }
  }

  private static async triggerCondonationNotifications(leaveId: string) {
    const missedClasses = await prisma.missedClass.findMany({
      where: { leaveApplicationId: leaveId },
      include: {
        course: {
          include: {
            department: {
              include: {
                faculty: {
                  include: {
                    user: true
                  }
                }
              }
            }
          }
        },
        leaveApplication: {
          include: {
            student: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    for (const mc of missedClasses) {
      const faculties = mc.course.department.faculty;
      for (const fac of faculties) {
        await prisma.notification.create({
          data: {
            userId: fac.userId,
            message: `Condonation Required: Student ${mc.leaveApplication.student.user.name} (${mc.leaveApplication.student.rollNumber}) missed ${mc.course.code} class on ${mc.date.toDateString()}.`,
            type: 'APPROVAL_REQUEST'
          }
        });
      }
    }
  }
}
