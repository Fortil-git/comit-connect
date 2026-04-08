import { Router } from 'express';
import { autreSujetController } from '../controllers/autreSujetController';

const router = Router();

router.get('/', autreSujetController.list);
router.get('/:id', autreSujetController.getById);
router.post('/', autreSujetController.create);
router.delete('/:id', autreSujetController.delete);

export default router;
