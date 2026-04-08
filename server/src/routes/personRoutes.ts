import { Router } from 'express';
import { personController } from '../controllers/personController';

const router = Router();

router.get('/', personController.list);
router.get('/:id', personController.getById);

export default router;
