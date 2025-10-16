import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/requireRole';

const router = Router();

// simple proof endpoint
router.get('/admin/ping', requireAuth, requireRole('admin','manager'), (req, res) => {
  res.json({ ok: true, message: 'admin pong' });
});

export default router;





