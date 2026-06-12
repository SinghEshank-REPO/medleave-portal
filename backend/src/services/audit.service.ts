import { prisma } from '../config/db';

export class AuditService {
  static async log({
    userId,
    action,
    details,
    ipAddress
  }: {
    userId: string;
    action: string;
    details: Record<string, any>;
    ipAddress?: string;
  }) {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          action,
          details: JSON.stringify(details),
          ipAddress: ipAddress || null
        }
      });
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }
}
