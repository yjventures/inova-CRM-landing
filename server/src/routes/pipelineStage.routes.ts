import { Router } from 'express';
import { pipelineStageController } from '../controllers/pipelineStage.controller';
import { requireAuth } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.get('/', requireAuth, pipelineStageController.list);
router.post('/', requireAuth, requireRole('manager','admin'), pipelineStageController.create);
router.patch('/:id', requireAuth, requireRole('manager','admin'), pipelineStageController.update);
router.delete('/:id', requireAuth, requireRole('manager','admin'), pipelineStageController.remove);
router.put('/reorder', requireAuth, requireRole('manager','admin'), pipelineStageController.reorder);

export default router;


