import { Router } from 'express';
import { comiteController } from '../controllers/comiteController';

const router = Router();

router.get('/', comiteController.list);
router.get('/:id', comiteController.getById);
router.get('/:id/full', comiteController.getFull);
router.post('/', comiteController.create);
router.put('/:id', comiteController.update);
router.put('/:id/end', comiteController.endSession);
router.put('/:id/reopen', comiteController.reopen);
router.delete('/:id', comiteController.delete);

export default router;
