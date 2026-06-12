import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { EscalationService } from '../services/escalation.service';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';
import { Role } from '../types';

const router = Router();

router.use(authenticateJWT);

// Admin-only actions
router.get('/audit', requireRoles(['ADMIN']), AdminController.getAuditLogs);
router.get('/analytics', requireRoles(['ADMIN']), AdminController.getAnalytics);
router.get('/users', requireRoles(['ADMIN']), AdminController.getUsers);

// Admin or HOD actions
router.get('/repeat-patterns', requireRoles(['ADMIN', 'HOD']), AdminController.getRepeatLeavePatterns);

// Trigger SLA turnarounds manual check (Admin only)
router.post('/escalate-check', requireRoles(['ADMIN']), async (req, res) => {
  try {
    const result = await EscalationService.checkAndEscalateLeaves();
    res.json({
      message: 'SLA escalation assessment processed.',
      ...result
    });
  } catch (error) {
    console.error('Trigger SLA escalation check error:', error);
    res.status(500).json({ message: 'Failed to run SLA escalation check.' });
  }
});

export default router;
