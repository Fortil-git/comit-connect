import { Router } from 'express';
import { noteController } from '../controllers/noteController';

const router = Router();

router.get('/', noteController.get);
router.get('/by-theme', noteController.getByTheme);
router.post('/', noteController.upsert);
router.put('/:id', noteController.update);
router.delete('/:id', noteController.delete);

// Attachments
router.get('/:id/attachments', noteController.listAttachments);
router.post('/:id/attachments', noteController.addAttachment);
router.delete('/:noteId/attachments/:attachmentId', noteController.deleteAttachment);

export default router;
