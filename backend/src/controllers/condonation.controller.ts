import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AuditService } from '../services/audit.service';
import { Role, CondonationStatus } from '../types';

export class CondonationController {
  static async listPending(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || !['FACULTY', 'HOD'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Only faculty members can access condonation logs.' });
      }

      // Fetch faculty details
      const faculty = await prisma.faculty.findUnique({
        where: { userId: req.user.id }
      });

      if (!faculty) {
        return res.status(404).json({ message: 'Faculty profile not found.' });
      }

      // Find all missed classes for courses in the faculty's department that are pending condonation
      const pendingClasses = await prisma.missedClass.findMany({
        where: {
          status: 'PENDING',
          course: {
            departmentId: faculty.departmentId
          },
          leaveApplication: {
            status: 'APPROVED' // Leave must be fully approved
          }
        },
        include: {
          course: true,
          leaveApplication: {
            include: {
              student: {
                include: {
                  user: true
                }
              }
            }
          }
        },
        orderBy: {
          date: 'asc'
        }
      });

      res.json(pendingClasses);
    } catch (error) {
      console.error('List pending condonations error:', error);
      res.status(500).json({ message: 'Failed to retrieve pending condonations.' });
    }
  }

  static async condone(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params; // missedClass ID
      const { action } = req.body; // CONDONE or REJECT

      if (!action || !['CONDONE', 'REJECT'].includes(action)) {
        return res.status(400).json({ message: 'Action must be CONDONE or REJECT.' });
      }

      if (!req.user || !['FACULTY', 'HOD'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Only faculty members can process condonations.' });
      }

      // Fetch faculty details
      const faculty = await prisma.faculty.findUnique({
        where: { userId: req.user.id }
      });

      if (!faculty) {
        return res.status(404).json({ message: 'Faculty profile not found.' });
      }

      const missedClass = await prisma.missedClass.findUnique({
        where: { id },
        include: {
          course: true,
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

      if (!missedClass) {
        return res.status(404).json({ message: 'Missed class record not found.' });
      }

      const statusMap: Record<string, string> = {
        CONDONE: 'CONDONED',
        REJECT: 'REJECTED'
      };

      const updatedClass = await prisma.missedClass.update({
        where: { id },
        data: {
          status: statusMap[action],
          facultyId: faculty.id,
          condonedAt: new Date()
        }
      });

      // Log action to audit trail
      await AuditService.log({
        userId: req.user.id,
        action: `${action}_ATTENDANCE`,
        details: {
          missedClassId: id,
          course: missedClass.course.code,
          studentName: missedClass.leaveApplication.student.user.name,
          date: missedClass.date
        }
      });

      // Notify Student
      await prisma.notification.create({
        data: {
          userId: missedClass.leaveApplication.student.userId,
          message: `Your absence on ${missedClass.date.toDateString()} for ${missedClass.course.code} has been ${action.toLowerCase()}d by ${req.user.name}.`,
          type: 'DECISION'
        }
      });

      res.json({
        message: `Absence has been ${action.toLowerCase()}d successfully.`,
        missedClass: updatedClass
      });
    } catch (error) {
      console.error('Condone class error:', error);
      res.status(500).json({ message: 'Failed to update condonation.' });
    }
  }

  static async getAttendanceStats(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'STUDENT') {
        return res.status(403).json({ message: 'Only students can check their attendance stats.' });
      }

      const student = await prisma.student.findUnique({
        where: { userId: req.user.id }
      });

      if (!student) return res.status(404).json({ message: 'Student profile not found.' });

      // Fetch enrollments and courses
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: student.id },
        include: { course: true }
      });

      // Calculate attendance statistics
      // We will mock total classes held in the semester (e.g. 30 classes per course)
      // And calculate attendance based on:
      // Condoned attendance = (Total Present + Condoned Leaves) / Total Classes Held
      // Raw attendance = Total Present / Total Classes Held
      const totalClassesHeld = 30;
      
      const stats = await Promise.all(
        enrollments.map(async (enroll) => {
          // Find how many missed classes exist for this course
          const missedCount = await prisma.missedClass.count({
            where: {
              leaveApplication: { studentId: student.id },
              courseId: enroll.courseId
            }
          });

          // Find how many are condoned
          const condonedCount = await prisma.missedClass.count({
            where: {
              leaveApplication: { studentId: student.id },
              courseId: enroll.courseId,
              status: 'CONDONED'
            }
          });

          // Simulate actual attendance
          // Let's assume standard present count is 22 out of 30, meaning student missed 8 classes
          // Out of those 8 missed classes, "missedCount" are covered by medical leave
          const baselinePresent = 22; 
          const rawAttendancePercentage = parseFloat(((baselinePresent / totalClassesHeld) * 100).toFixed(1));
          
          // Condoned attendance adds the condoned leaves to the numerator
          const condonedPresent = baselinePresent + condonedCount;
          const condonedAttendancePercentage = parseFloat(
            Math.min(((condonedPresent / totalClassesHeld) * 100), 100).toFixed(1)
          );

          return {
            courseCode: enroll.course.code,
            courseName: enroll.course.name,
            credits: enroll.course.credits,
            totalClasses: totalClassesHeld,
            present: baselinePresent,
            missed: totalClassesHeld - baselinePresent,
            medicalAbsences: missedCount,
            condonedAbsences: condonedCount,
            rawAttendance: rawAttendancePercentage,
            condonedAttendance: condonedAttendancePercentage
          };
        })
      );

      res.json(stats);
    } catch (error) {
      console.error('Get attendance stats error:', error);
      res.status(500).json({ message: 'Failed to compute attendance stats.' });
    }
  }
}
