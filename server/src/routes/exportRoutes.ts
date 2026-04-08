import { Router } from 'express';
import { exportController } from '../controllers/exportController';

const router = Router();

router.get('/', exportController.list);
router.post('/', exportController.create);
router.delete('/:id', exportController.delete);

export default router;
