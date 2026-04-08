import { Router } from 'express';
import { authController } from '../controllers/authController';

const router = Router();

router.post('/login', authController.login);
router.get('/me', authController.me);
router.post('/logout', authController.logout);

export default router;
