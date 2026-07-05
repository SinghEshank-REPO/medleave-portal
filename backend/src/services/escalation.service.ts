import { prisma } from '../config/db';
import { Role, LeaveStatus, NotificationType } from '../types';
import { AuditService } from './audit.service';

export class EscalationService {
  /**
   * Scans pending applications and applies JUIT turnaround SLA escalation policies.
   * Typically executed via cron or triggered manually for testing/evaluation.
   */
  static async checkAndEscalateLeaves(): Promise<{ escalatedCount: number; autoForwardedCount: number }> {
    const now = new Date();
    let escalatedCount = 0;
    let autoForwardedCount = 0;

    // 1. Fetch all pending leave applications
    const pendingLeaves = await prisma.leaveApplication.findMany({
      where: {
        status: {
          in: [
            'PENDING_HEALTH_CENTRE',
            'PENDING_WARDEN',
            'PENDING_FACULTY'
          ]
        }
      },
      include: {
        student: {
          include: {
            user: true
          }
        }
      }
    });

    for (const leave of pendingLeaves) {
      let deadline: Date | null = null;
      let nextRole: Role = 'MED_OFFICER';
      let nextStatus: LeaveStatus = 'PENDING_HEALTH_CENTRE';

      if (leave.status === 'PENDING_HEALTH_CENTRE') {
        deadline = leave.healthCentreDeadline;
        nextRole = leave.student.isResidential ? 'WARDEN' : 'FACULTY';
        nextStatus = leave.student.isResidential ? 'PENDING_WARDEN' : 'PENDING_FACULTY';
      } else if (leave.status === 'PENDING_WARDEN') {
        deadline = leave.wardenDeadline;
        nextRole = 'FACULTY';
        nextStatus = 'PENDING_FACULTY';
      } else if (leave.status === 'PENDING_FACULTY') {
        deadline = leave.facultyDeadline;
        nextRole = 'FACULTY';
        nextStatus = 'APPROVED';
      }

      if (!deadline) continue;

      const timeDiffMs = now.getTime() - deadline.getTime();

      // For Health Centre and Warden, they auto-approve immediately when the 24h deadline passes.
      // For Faculty, they auto-approve when the 48h deadline passes, but send a reminder at 24h.
      if (leave.status === 'PENDING_HEALTH_CENTRE' || leave.status === 'PENDING_WARDEN') {
        if (timeDiffMs > 0) {
          // Deadline lapsed - Auto-forward/approve!
          console.log(`[EscalationService] SLA deadline lapsed for application ${leave.id} under status ${leave.status}. Auto-forwarding.`);
          
          let updateData: any = {};
          if (leave.status === 'PENDING_HEALTH_CENTRE') {
            updateData = {
              status: nextStatus,
              healthCentreApproved: true, // Auto-verified
              currentApproverRole: nextRole,
              remarks: (leave.remarks || '') + '\n[SLA Auto-Forwarded by Health Centre omission after 24 hrs]',
              isEscalated: false,
              wardenDeadline: leave.student.isResidential ? new Date(now.getTime() + 24 * 60 * 60 * 1000) : null,
              facultyDeadline: !leave.student.isResidential ? new Date(now.getTime() + 48 * 60 * 60 * 1000) : null
            };
          } else if (leave.status === 'PENDING_WARDEN') {
            updateData = {
              status: nextStatus,
              wardenApproved: true,
              currentApproverRole: nextRole,
              remarks: (leave.remarks || '') + '\n[SLA Auto-Forwarded by Warden omission after 24 hrs]',
              isEscalated: false,
              facultyDeadline: new Date(now.getTime() + 48 * 60 * 60 * 1000)
            };
          }

          const updatedLeave = await prisma.leaveApplication.update({
            where: { id: leave.id },
            data: updateData
          });

          await AuditService.log({
            userId: '00000000-0000-0000-0000-000000000000',
            action: 'SLA_AUTO_FORWARD',
            details: { leaveApplicationId: leave.id, originalStatus: leave.status, targetStatus: updatedLeave.status }
          });

          await prisma.notification.create({
            data: {
              userId: leave.student.userId,
              message: `Your leave application has been auto-forwarded to the next stage due to approval SLA lapse.`,
              type: 'ESCALATION'
            }
          });

          autoForwardedCount++;
        }
      } else if (leave.status === 'PENDING_FACULTY') {
        const hasPassed48h = timeDiffMs > 0;
        const hasPassed24h = timeDiffMs > -24 * 60 * 60 * 1000; // 24h of the 48h limit have elapsed

        if (hasPassed48h) {
          // Auto-approve!
          console.log(`[EscalationService] SLA 48h deadline lapsed for application ${leave.id} under Faculty review. Auto-approving.`);
          
          await prisma.leaveApplication.update({
            where: { id: leave.id },
            data: {
              status: 'APPROVED',
              facultyApproved: true,
              currentApproverRole: 'FACULTY',
              remarks: (leave.remarks || '') + '\n[SLA Auto-Approved by Faculty omission after 48 hrs]',
              isEscalated: false,
              facultyDeadline: null
            }
          });

          // Auto-condone all missed classes
          await prisma.missedClass.updateMany({
            where: { leaveApplicationId: leave.id, status: 'PENDING' },
            data: {
              status: 'CONDONED',
              condonedAt: new Date()
            }
          });

          await AuditService.log({
            userId: '00000000-0000-0000-0000-000000000000',
            action: 'SLA_AUTO_FORWARD',
            details: { leaveApplicationId: leave.id, originalStatus: leave.status, targetStatus: 'APPROVED' }
          });

          await prisma.notification.create({
            data: {
              userId: leave.student.userId,
              message: `Your leave application has been auto-approved as the Faculty review window (48h) lapsed.`,
              type: 'ESCALATION'
            }
          });

          // Trigger missed class condoned notifications
          await this.triggerCondonationRequests(leave.id);
          autoForwardedCount++;
        } else if (hasPassed24h && !leave.isEscalated) {
          // Send reminder (escalate)
          console.log(`[EscalationService] SLA 24h passed for application ${leave.id} under Faculty review. Sending reminder.`);
          
          await prisma.leaveApplication.update({
            where: { id: leave.id },
            data: { isEscalated: true }
          });

          // Notify all faculty of student's department
          const studentProfile = await prisma.student.findUnique({
            where: { id: leave.studentId }
          });
          if (studentProfile) {
            const departmentFaculties = await prisma.faculty.findMany({
              where: { departmentId: studentProfile.departmentId }
            });
            for (const fac of departmentFaculties) {
              await prisma.notification.create({
                data: {
                  userId: fac.userId,
                  message: `URGENT REMINDER: Leave application for student ${leave.student.user.name} (${leave.student.rollNumber}) requires Faculty review. Window is lapsing in 24 hours.`,
                  type: 'ESCALATION'
                }
              });
            }
          }

          // Notify student
          await prisma.notification.create({
            data: {
              userId: leave.student.userId,
              message: `Your leave application has been escalated to the Faculty department due to no response in 24 hours.`,
              type: 'ESCALATION'
            }
          });

          escalatedCount++;
        }
      }
    }

    return { escalatedCount, autoForwardedCount };
  }

  private static async triggerCondonationRequests(leaveId: string) {
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
            message: `Condonation Request: Student ${mc.leaveApplication.student.user.name} missed ${mc.course.code} on ${mc.date.toDateString()} due to approved medical leave. Click to condone.`,
            type: 'APPROVAL_REQUEST'
          }
        });
      }
    }
  }
}
