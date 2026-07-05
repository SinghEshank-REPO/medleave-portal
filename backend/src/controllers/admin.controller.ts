import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { Role } from '../types';

export class AdminController {
  static async getAuditLogs(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Only administrators can inspect audit logs.' });
      }

      const logs = await prisma.auditLog.findMany({
        include: {
          user: {
            select: {
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 100 // limit to last 100 entries for readability
      });

      res.json(logs);
    } catch (error) {
      console.error('Fetch audit logs error:', error);
      res.status(500).json({ message: 'Failed to fetch audit logs.' });
    }
  }

  static async getRepeatLeavePatterns(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || !['ADMIN', 'HOD'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Unauthorized. Restricted to Admin/HOD.' });
      }

      // Group leave applications by studentId and count them
      // Flag students who have > 2 applications (configurable, let's use 2 or 3 for testing)
      const threshold = 2;

      const repeatStudents = await prisma.leaveApplication.groupBy({
        by: ['studentId'],
        _count: {
          id: true
        },
        having: {
          studentId: {
            _count: {
              gt: threshold - 1
            }
          }
        }
      });

      const flaggedStudents = await Promise.all(
        repeatStudents.map(async (group) => {
          const student = await prisma.student.findUnique({
            where: { id: group.studentId },
            include: {
              user: { select: { name: true, email: true } },
              department: true
            }
          });

          // Fetch all leaves for this student to get details
          const leaves = await prisma.leaveApplication.findMany({
            where: { studentId: group.studentId },
            select: { id: true, startDate: true, endDate: true, status: true, category: true }
          });

          return {
            studentId: group.studentId,
            name: student?.user.name,
            rollNumber: student?.rollNumber,
            department: student?.department.name,
            hostel: student?.hostelName,
            leaveCount: group._count.id,
            leaves
          };
        })
      );

      res.json(flaggedStudents);
    } catch (error) {
      console.error('Fetch repeat leave pattern error:', error);
      res.status(500).json({ message: 'Failed to retrieve repeat patterns.' });
    }
  }

  static async getAnalytics(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Access restricted to administrators.' });
      }

      // 1. Total counts
      const studentCount = await prisma.student.count();
      const leavesCount = await prisma.leaveApplication.count();
      const approvedCount = await prisma.leaveApplication.count({ where: { status: 'APPROVED' } });
      const rejectedCount = await prisma.leaveApplication.count({ where: { status: 'REJECTED' } });
      const pendingCount = await prisma.leaveApplication.count({
        where: {
          status: {
            in: ['PENDING_HEALTH_CENTRE', 'PENDING_WARDEN', 'PENDING_FACULTY']
          }
        }
      });

      // 2. Suspicious certificates flagged by AI
      const suspiciousCount = await prisma.aIAnalysis.count({
        where: {
          status: 'SUSPICIOUS'
        }
      });

      // 3. Leaves by department
      const departments = await prisma.department.findMany({
        include: {
          students: {
            include: {
              leaves: true
            }
          }
        }
      });

      const departmentStats = departments.map((dept) => {
        let count = 0;
        dept.students.forEach((stud) => {
          count += stud.leaves.length;
        });
        return {
          name: dept.name,
          code: dept.code,
          leaveCount: count
        };
      });

      // 4. Leave trends (Monthly distribution mock/real mix)
      // We'll read the real count in db
      const leaves = await prisma.leaveApplication.findMany({
        select: { createdAt: true }
      });

      const monthlyTrendMap: Record<string, number> = {
        'Jan': 0, 'Feb': 0, 'Mar': 0, 'Apr': 0, 'May': 0, 'Jun': 0,
        'Jul': 0, 'Aug': 0, 'Sep': 0, 'Oct': 0, 'Nov': 0, 'Dec': 0
      };

      leaves.forEach((l) => {
        const month = l.createdAt.toLocaleString('default', { month: 'short' });
        if (monthlyTrendMap[month] !== undefined) {
          monthlyTrendMap[month]++;
        }
      });

      const monthlyTrends = Object.keys(monthlyTrendMap).map((key) => ({
        month: key,
        count: monthlyTrendMap[key]
      }));

      res.json({
        counts: {
          students: studentCount,
          totalLeaves: leavesCount,
          approved: approvedCount,
          rejected: rejectedCount,
          pending: pendingCount,
          suspicious: suspiciousCount
        },
        departmentStats,
        monthlyTrends
      });
    } catch (error) {
      console.error('Fetch analytics error:', error);
      res.status(500).json({ message: 'Failed to retrieve analytics.' });
    }
  }

  static async getUsers(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Restricted to Admin.' });
      }

      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        },
        orderBy: {
          role: 'asc'
        }
      });

      res.json(users);
    } catch (error) {
      console.error('Fetch users error:', error);
      res.status(500).json({ message: 'Failed to fetch users.' });
    }
  }
}
