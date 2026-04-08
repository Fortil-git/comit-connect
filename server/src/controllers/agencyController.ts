import { Request, Response } from 'express';
import prisma from '../config/database';

export const agencyController = {
  async list(_req: Request, res: Response) {
    const agencies = await prisma.agency.findMany({
      orderBy: { city: 'asc' },
    });
    res.json(agencies);
  },

  async getById(req: Request, res: Response) {
    const agency = await prisma.agency.findUnique({
      where: { id: req.params.id },
    });
    if (!agency) {
      return res.status(404).json({ error: 'Agence non trouvée' });
    }
    res.json(agency);
  },
};
