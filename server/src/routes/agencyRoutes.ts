import { Router } from 'express';
import { agencyController } from '../controllers/agencyController';

const router = Router();

router.get('/', agencyController.list);
router.get('/:id', agencyController.getById);

export default router;
