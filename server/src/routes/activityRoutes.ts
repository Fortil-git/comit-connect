import { Router } from 'express';
import { activityController } from '../controllers/activityController';

const router = Router();

// Toutes les routes sont préfixées par /comites/:comiteId/activities
router.get('/:comiteId/activities', activityController.listByComite);
router.get('/:comiteId/activities/count-by-theme', activityController.countByTheme);
router.get('/:comiteId/activities/count-by-subtheme', activityController.countBySubTheme);
router.post('/:comiteId/activities', activityController.create);

export default router;
