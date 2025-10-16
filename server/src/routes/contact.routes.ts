import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { requireAnyRole } from '../middleware/requireRole';
import { contactController } from '../controllers/contact.controller';

const router = Router();

router.get('/contacts', requireAuth, requireAnyRole(), contactController.listContacts);
router.get('/contacts/:id', requireAuth, requireAnyRole(), contactController.getContact);
router.post('/contacts', requireAuth, requireAnyRole(), contactController.createContact);
router.patch('/contacts/:id', requireAuth, requireAnyRole(), contactController.updateContact);
router.delete('/contacts/:id', requireAuth, requireAnyRole(), contactController.deleteContact);

export default router;


