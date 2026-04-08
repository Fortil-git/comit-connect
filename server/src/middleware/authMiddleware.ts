import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  next();
};

export const requireSuperAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  const user = await prisma.person.findUnique({
    where: { id: req.session.userId },
  });

  if (!user || user.userRole !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Accès interdit : droits SUPER_ADMIN requis' });
  }

  next();
};
