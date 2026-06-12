import { Router } from 'express';
import { CondonationController } from '../controllers/condonation.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/pending', CondonationController.listPending);
router.post('/:id', CondonationController.condone);
router.get('/stats', CondonationController.getAttendanceStats);

export default router;
