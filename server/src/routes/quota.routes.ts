import { Router } from 'express';
import { quotaController } from '../controllers/quota.controller';
import { requireAuth } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.get('/current', requireAuth, quotaController.getCurrent);
router.post('/', requireAuth, requireRole('manager','admin'), quotaController.upsert);

export default router;


