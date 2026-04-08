import { Request, Response } from 'express';
import prisma from '../config/database';
import { toDbActionStatut, formatActionForFrontend } from '../types';

export const actionController = {
  async list(req: Request, res: Response) {
    const { statut, themeId, comiteId } = req.query;
    const where: any = {};

    if (statut && statut !== 'all') {
      where.statut = toDbActionStatut(statut as string);
    }
    if (themeId && themeId !== 'all') {
      where.themeId = themeId;
    }
    if (comiteId && comiteId !== 'all') {
      where.comiteId = comiteId;
    }

    const actions = await prisma.action.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(actions.map(formatActionForFrontend));
  },

  async getById(req: Request, res: Response) {
    const action = await prisma.action.findUnique({
      where: { id: req.params.id },
    });
    if (!action) {
      return res.status(404).json({ error: 'Action non trouvée' });
    }
    res.json(formatActionForFrontend(action));
  },

  async create(req: Request, res: Response) {
    const {
      themeId, themeName, subThemeId, subThemeName,
      title, description, responsables, echeance, comiteId,
    } = req.body;

    const action = await prisma.action.create({
      data: {
        themeId,
        themeName,
        subThemeId,
        subThemeName,
        title,
        description: description || '',
        responsables: responsables || '',
        echeance: new Date(echeance),
        comiteId,
      },
    });

    res.status(201).json(formatActionForFrontend(action));
  },

  async update(req: Request, res: Response) {
    const { title, description, responsables, echeance, statut, commentaireAbandon } = req.body;

    const data: any = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (responsables !== undefined) data.responsables = responsables;
    if (echeance !== undefined) data.echeance = new Date(echeance);
    if (statut !== undefined) data.statut = toDbActionStatut(statut) as any;
    if (commentaireAbandon !== undefined) data.commentaireAbandon = commentaireAbandon;

    const action = await prisma.action.update({
      where: { id: req.params.id },
      data,
    });

    res.json(formatActionForFrontend(action));
  },

  async updateStatut(req: Request, res: Response) {
    const { statut, commentaireAbandon } = req.body;

    const action = await prisma.action.update({
      where: { id: req.params.id },
      data: {
        statut: toDbActionStatut(statut) as any,
        commentaireAbandon,
      },
    });

    res.json(formatActionForFrontend(action));
  },

  async delete(req: Request, res: Response) {
    await prisma.action.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  },
};
