import { Request, Response } from 'express';
import prisma from '../config/database';

export const autreSujetController = {
  async list(req: Request, res: Response) {
    const { comiteId } = req.query;
    const where: any = {};

    if (comiteId) where.comiteId = comiteId;

    const sujets = await prisma.autreSujet.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(sujets);
  },

  async getById(req: Request, res: Response) {
    const sujet = await prisma.autreSujet.findUnique({
      where: { id: req.params.id },
    });
    if (!sujet) {
      return res.status(404).json({ error: 'Sujet non trouvé' });
    }
    res.json(sujet);
  },

  async create(req: Request, res: Response) {
    const { comiteId, titre, description } = req.body;

    const sujet = await prisma.autreSujet.create({
      data: {
        comiteId,
        titre,
        description: description || '',
      },
    });

    res.status(201).json(sujet);
  },

  async delete(req: Request, res: Response) {
    await prisma.autreSujet.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  },
};
