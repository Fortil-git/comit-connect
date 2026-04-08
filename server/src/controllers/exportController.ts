import { Request, Response } from 'express';
import prisma from '../config/database';

export const exportController = {
  async list(req: Request, res: Response) {
    const { comiteId } = req.query;
    const where: any = {};

    if (comiteId) where.comiteId = comiteId;

    const exports = await prisma.exportHistory.findMany({
      where,
      orderBy: { exportedAt: 'desc' },
    });

    res.json(exports);
  },

  async create(req: Request, res: Response) {
    const { comiteId, comiteDate, comiteEntite, fileName } = req.body;

    const exportRecord = await prisma.exportHistory.create({
      data: {
        comiteId,
        comiteDate: new Date(comiteDate),
        comiteEntite,
        fileName,
      },
    });

    res.status(201).json(exportRecord);
  },

  async delete(req: Request, res: Response) {
    await prisma.exportHistory.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  },
};
