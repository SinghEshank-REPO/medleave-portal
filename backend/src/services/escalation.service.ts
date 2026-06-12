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
            'PENDING_ADVISOR'
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
        nextRole = 'WARDEN';
        nextStatus = leave.student.isResidential ? 'PENDING_WARDEN' : 'PENDING_ADVISOR';
      } else if (leave.status === 'PENDING_WARDEN') {
        deadline = leave.wardenDeadline;
        nextRole = 'ADVISOR';
        nextStatus = 'PENDING_ADVISOR';
      } else if (leave.status === 'PENDING_ADVISOR') {
        deadline = leave.advisorDeadline;
        nextRole = 'HOD';
        nextStatus = 'APPROVED'; // Escalates directly to approved (or HOD review)
      }

      if (!deadline) continue;

      const timeDiffMs = now.getTime() - deadline.getTime();
      const doubleWindowLapse = timeDiffMs > 0 && leave.isEscalated; // Already escalated once, and double time has passed
      const singleWindowLapse = timeDiffMs > 0 && !leave.isEscalated; // Lapsed once

      if (doubleWindowLapse) {
        // AUTO FORWARD: Escalate to next stage since authority missed both windows
        console.log(`[EscalationService] SLA second window lapsed for application ${leave.id}. Auto-forwarding status.`);
        
        let updateData: any = {};
        if (leave.status === 'PENDING_HEALTH_CENTRE') {
          updateData = {
            status: nextStatus,
            healthCentreApproved: true, // Marked as auto-bypassed
            currentApproverRole: nextRole,
            remarks: (leave.remarks || '') + '\n[SLA Auto-Forwarded by Health Centre omission]',
            isEscalated: false,
            // Set next deadline (24 hours from now)
            wardenDeadline: new Date(now.getTime() + 24 * 60 * 60 * 1000),
            advisorDeadline: new Date(now.getTime() + 48 * 60 * 60 * 1000)
          };
        } else if (leave.status === 'PENDING_WARDEN') {
          updateData = {
            status: nextStatus,
            wardenApproved: true,
            currentApproverRole: nextRole,
            remarks: (leave.remarks || '') + '\n[SLA Auto-Forwarded by Warden omission]',
            isEscalated: false,
            advisorDeadline: new Date(now.getTime() + 48 * 60 * 60 * 1000)
          };
        } else if (leave.status === 'PENDING_ADVISOR') {
          updateData = {
            status: 'APPROVED',
            advisorApproved: true,
            currentApproverRole: 'FACULTY',
            remarks: (leave.remarks || '') + '\n[SLA Auto-Approved by Advisor omission]',
            isEscalated: false
          };
        }

        const updatedLeave = await prisma.leaveApplication.update({
          where: { id: leave.id },
          data: updateData
        });

        // Log to Audit Trail
        await AuditService.log({
          userId: '00000000-0000-0000-0000-000000000000', // System account
          action: 'SLA_AUTO_FORWARD',
          details: { leaveApplicationId: leave.id, originalStatus: leave.status, targetStatus: updatedLeave.status }
        });

        // Notify student of progress
        await prisma.notification.create({
          data: {
            userId: leave.student.userId,
            message: `Your leave application has been auto-forwarded to the next stage due to approval SLA lapse.`,
            type: 'ESCALATION'
          }
        });

        // Trigger missed class condonation checks if it was approved
        if (updatedLeave.status === 'APPROVED') {
          // Trigger condonation request notifications for faculty
          await this.triggerCondonationRequests(leave.id);
        }

        autoForwardedCount++;
      } else if (singleWindowLapse) {
        // SINGLE WINDOW: Flag as escalated, send high priority warnings
        console.log(`[EscalationService] SLA turnaround window lapsed for application ${leave.id}. Marking escalated.`);
        
        await prisma.leaveApplication.update({
          where: { id: leave.id },
          data: { isEscalated: true }
        });

        // Create alert for relevant role
        const approverUsers = await prisma.user.findMany({
          where: { role: leave.currentApproverRole }
        });

        for (const user of approverUsers) {
          await prisma.notification.create({
            data: {
              userId: user.id,
              message: `URGENT: Leave application for student ${leave.student.user.name} (${leave.student.rollNumber}) has lapsed response window. Immediate action required.`,
              type: 'ESCALATION'
            }
          });
        }

        // Notify Student
        await prisma.notification.create({
          data: {
            userId: leave.student.userId,
            message: `Your leave application approval window has lapsed and has been escalated.`,
            type: 'ESCALATION'
          }
        });

        escalatedCount++;
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
