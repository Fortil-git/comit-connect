import { Request, Response } from 'express';
import prisma from '../config/database';

export const personController = {
  async list(req: Request, res: Response) {
    const { search } = req.query;

    const where = search
      ? {
          fullName: {
            contains: search as string,
            mode: 'insensitive' as const,
          },
        }
      : {};

    const persons = await prisma.person.findMany({
      where,
      orderBy: { fullName: 'asc' },
    });
    res.json(persons);
  },

  async getById(req: Request, res: Response) {
    const person = await prisma.person.findUnique({
      where: { id: req.params.id },
    });
    if (!person) {
      return res.status(404).json({ error: 'Personne non trouvée' });
    }
    res.json(person);
  },
};
