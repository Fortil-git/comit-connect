import { Router } from 'express';
import { requireSuperAdmin } from '../middleware/authMiddleware';
import { adminUserController } from '../controllers/adminUserController';
import { adminThemeController } from '../controllers/adminThemeController';

const router = Router();

// All admin routes require SUPER_ADMIN role
router.use(requireSuperAdmin);

// User CRUD
router.get('/users', adminUserController.list);
router.get('/users/:id', adminUserController.getById);
router.post('/users', adminUserController.create);
router.put('/users/:id', adminUserController.update);
router.delete('/users/:id', adminUserController.delete);
router.put('/users/:id/toggle-active', adminUserController.toggleActive);

// Theme CRUD
router.get('/themes', adminThemeController.list);
router.get('/themes/:id', adminThemeController.getById);
router.post('/themes', adminThemeController.create);
router.put('/themes/:id', adminThemeController.update);
router.delete('/themes/:id', adminThemeController.delete);

// Sub-Theme CRUD
router.post('/themes/:themeId/sub-themes', adminThemeController.createSubTheme);
router.put('/themes/:themeId/sub-themes/:subThemeId', adminThemeController.updateSubTheme);
router.delete('/themes/:themeId/sub-themes/:subThemeId', adminThemeController.deleteSubTheme);

export default router;
