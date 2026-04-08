import { Request, Response } from 'express';
import prisma from '../config/database';
import crypto from 'crypto';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export const authController = {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const user = await prisma.person.findUnique({
      where: { email },
      include: { agency: true },
    });

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Compte désactivé. Contactez un administrateur.' });
    }

    const hashedInput = hashPassword(password);
    if (hashedInput !== user.password) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    req.session.userId = user.id;

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, agency: user.agency });
  },

  async me(req: Request, res: Response) {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const user = await prisma.person.findUnique({
      where: { id: req.session.userId },
      include: { agency: true },
    });

    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ error: 'Utilisateur invalide' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, agency: user.agency });
  },

  async logout(req: Request, res: Response) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de la déconnexion' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Déconnexion réussie' });
    });
  },
};
