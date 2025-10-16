import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';

const router = Router();

router.get('/dashboard/kpis', dashboardController.getKpis);
router.get('/dashboard/pipeline-summary', dashboardController.getPipelineSummary);
router.get('/dashboard/activity-overview', dashboardController.getActivityOverview);
router.get('/dashboard/performance-trend', dashboardController.getPerformanceTrend);

export default router;


