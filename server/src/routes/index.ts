import { Router } from 'express';
import authRoutes from './authRoutes';
import agencyRoutes from './agencyRoutes';
import personRoutes from './personRoutes';
import comiteRoutes from './comiteRoutes';
import activityRoutes from './activityRoutes';
import actionRoutes from './actionRoutes';
import voteRoutes from './voteRoutes';
import noteRoutes from './noteRoutes';
import autreSujetRoutes from './autreSujetRoutes';
import exportRoutes from './exportRoutes';
import adminRoutes from './adminRoutes';
import themeRoutes from './themeRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/themes', themeRoutes);
router.use('/agencies', agencyRoutes);
router.use('/persons', personRoutes);
router.use('/comites', comiteRoutes);
router.use('/comites', activityRoutes); // /comites/:comiteId/activities
router.use('/actions', actionRoutes);
router.use('/votes', voteRoutes);
router.use('/notes', noteRoutes);
router.use('/autres-sujets', autreSujetRoutes);
router.use('/exports', exportRoutes);

export { router as routes };
