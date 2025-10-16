import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import ensureDealOwnerOrRole from '../middleware/ensureDealOwnerOrRole';
import { dealController } from '../controllers/deal.controller';

const router = Router();

// All endpoints require auth
router.get('/deals', requireAuth, dealController.listDeals);
router.get('/deals/:id', requireAuth, ensureDealOwnerOrRole, dealController.getDeal);
router.post('/deals', requireAuth, dealController.createDeal);
router.patch('/deals/:id', requireAuth, ensureDealOwnerOrRole, dealController.updateDeal);
router.delete('/deals/:id', requireAuth, ensureDealOwnerOrRole, dealController.deleteDeal);
router.patch('/deals/:id/stage', requireAuth, ensureDealOwnerOrRole, dealController.updateDealStage);

export default router;

