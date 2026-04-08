import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('[Error]', err.message);

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Ressource non trouvée' });
    }
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Conflit : cette ressource existe déjà' });
    }
    return res.status(400).json({ error: `Erreur base de données: ${err.message}` });
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({ error: 'Données invalides' });
  }

  return res.status(500).json({ error: 'Erreur interne du serveur' });
}
