import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { requireAnyRole } from '../middleware/requireRole';
import { activityController } from '../controllers/activity.controller';

const router = Router();

router.get('/activities', requireAuth, requireAnyRole(), activityController.listActivities);
router.get('/activities/upcoming', requireAuth, requireAnyRole(), activityController.upcomingTasks);
router.get('/activities/:id', requireAuth, requireAnyRole(), activityController.getActivity);
router.post('/activities', requireAuth, requireAnyRole(), activityController.createActivity);
router.patch('/activities/:id', requireAuth, requireAnyRole(), activityController.updateActivity);
router.patch('/activities/:id/complete', requireAuth, requireAnyRole(), activityController.completeActivity);
router.delete('/activities/:id', requireAuth, requireAnyRole(), activityController.deleteActivity);

export default router;


