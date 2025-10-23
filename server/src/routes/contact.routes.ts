import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { requireAnyRole } from '../middleware/requireRole';
import { contactController } from '../controllers/contact.controller';

const router = Router();

router.get('/contacts', requireAuth, requireAnyRole(), contactController.listContacts);
router.get('/contacts/:id', requireAuth, requireAnyRole(), contactController.getContact);
router.get('/contacts/:id/deals', requireAuth, requireAnyRole(), (contactController as unknown as any).getContactDeals);
router.get('/contacts/:id/activities', requireAuth, requireAnyRole(), (contactController as unknown as any).getContactActivities);
router.post('/contacts', requireAuth, requireAnyRole(), contactController.createContact);
router.post('/contacts/import', requireAuth, requireAnyRole(), (async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (!items.length) return res.status(400).json({ ok: false, message: 'No items provided' });
    const { Contact } = await import('../models/Contact');
    const created = await Contact.insertMany(items.map((c: any) => ({
      fullName: c.fullName,
      email: c.email,
      phone: c.phone,
      company: c.company,
      title: c.title,
      status: c.status ?? 'active',
      ownerId: (req as any).user?.sub,
      tags: c.tags ?? [],
      notes: c.notes,
    })), { ordered: false });
    res.json({ ok: true, data: created });
  } catch (err) { next(err); }
}) as any);
router.patch('/contacts/:id', requireAuth, requireAnyRole(), contactController.updateContact);
router.delete('/contacts/:id', requireAuth, requireAnyRole(), contactController.deleteContact);

// Notes CRUD
router.get('/contacts/:id/notes', requireAuth, requireAnyRole(), (contactController as unknown as any).listNotes);
router.post('/contacts/:id/notes', requireAuth, requireAnyRole(), (contactController as unknown as any).addNote);
router.patch('/contacts/:id/notes/:noteId', requireAuth, requireAnyRole(), (contactController as unknown as any).updateNote);
router.delete('/contacts/:id/notes/:noteId', requireAuth, requireAnyRole(), (contactController as unknown as any).deleteNote);

export default router;


