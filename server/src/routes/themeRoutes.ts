import { Router } from 'express';
import { themeController } from '../controllers/themeController';

const router = Router();

router.get('/', themeController.list);

export default router;
