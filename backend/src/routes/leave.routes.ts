import { Router } from 'express';
import { LeaveController } from '../controllers/leave.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.use(authenticateJWT);

router.post('/', upload.single('certificate'), LeaveController.apply);
router.get('/', LeaveController.list);
router.get('/:id', LeaveController.getDetails);
router.post('/:id/review', LeaveController.review);
router.post('/:id/comment', LeaveController.addComment);
router.get('/:id/report', LeaveController.downloadReport);

export default router;
