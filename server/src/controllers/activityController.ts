import { Request, Response } from 'express';
import prisma from '../config/database';
import { toDbActivityType, formatActivityForFrontend } from '../types';

export const activityController = {
  async listByComite(req: Request, res: Response) {
    const { comiteId } = req.params;
    const { themeId } = req.query;

    const where: any = { comiteId };
    if (themeId) {
      where.details = {
        path: ['themeId'],
        equals: themeId,
      };
    }

    const activities = await prisma.activity.findMany({
      where,
      orderBy: { timestamp: 'asc' },
    });

    res.json(activities.map(formatActivityForFrontend));
  },

  async countByTheme(req: Request, res: Response) {
    const { comiteId } = req.params;

    const activities = await prisma.activity.findMany({
      where: { comiteId },
      select: { details: true },
    });

    // Compter les activités par themeId extrait du champ details
    const counts: Record<string, number> = {};
    for (const activity of activities) {
      const details = activity.details as any;
      const themeId = details?.themeId || 'unknown';
      counts[themeId] = (counts[themeId] || 0) + 1;
    }

    res.json(counts);
  },

  async countBySubTheme(req: Request, res: Response) {
    const { comiteId } = req.params;
    const { themeId } = req.query;

    const activities = await prisma.activity.findMany({
      where: { comiteId },
      select: { details: true },
    });

    const counts: Record<string, number> = {};
    for (const activity of activities) {
      const details = activity.details as any;
      if (themeId && details?.themeId !== themeId) continue;
      const subThemeId = details?.subThemeId || 'unknown';
      counts[subThemeId] = (counts[subThemeId] || 0) + 1;
    }

    res.json(counts);
  },

  async create(req: Request, res: Response) {
    const { comiteId } = req.params;
    const { type, description, details } = req.body;

    const activity = await prisma.activity.create({
      data: {
        comiteId,
        type: toDbActivityType(type) as any,
        description,
        details,
      },
    });

    res.status(201).json(formatActivityForFrontend(activity));
  },
};
