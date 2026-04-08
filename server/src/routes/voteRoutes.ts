import { Router } from 'express';
import { voteController } from '../controllers/voteController';

const router = Router();

router.get('/', voteController.list);
router.get('/:id', voteController.getById);
router.post('/', voteController.create);
router.put('/:id/cast', voteController.castVote);
router.delete('/:id', voteController.delete);

export default router;
