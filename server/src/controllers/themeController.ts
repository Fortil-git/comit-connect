import { Request, Response } from 'express';
import prisma from '../config/database';

export const themeController = {
  async list(_req: Request, res: Response) {
    const themes = await prisma.theme.findMany({
      include: { subThemes: { orderBy: { order: 'asc' } } },
      orderBy: { order: 'asc' },
    });
    res.json(themes);
  },
};
