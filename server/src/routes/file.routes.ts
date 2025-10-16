import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { fileController } from '../controllers/file.controller';
import { upload } from '../lib/multer';

const router = Router();

router.post(
  '/files',
  requireAuth,
  upload.fields([
    { name: 'files', maxCount: 10 },
    { name: 'file', maxCount: 1 },
  ]),
  fileController.upload
);
router.get('/files', requireAuth, fileController.list);
router.get('/files/:entityType/:entityId', requireAuth, fileController.listByEntity);
router.delete('/files/:id', requireAuth, fileController.remove);

export default router;


