import { Router } from 'express';
import { actionController } from '../controllers/actionController';

const router = Router();

router.get('/', actionController.list);
router.get('/:id', actionController.getById);
router.post('/', actionController.create);
router.put('/:id', actionController.update);
router.put('/:id/statut', actionController.updateStatut);
router.delete('/:id', actionController.delete);

export default router;
