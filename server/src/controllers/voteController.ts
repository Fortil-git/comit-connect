import { Request, Response } from 'express';
import prisma from '../config/database';

export const voteController = {
  async list(req: Request, res: Response) {
    const { themeId, subThemeId, comiteId } = req.query;
    const where: any = {};

    if (themeId) where.themeId = themeId;
    if (subThemeId) where.subThemeId = subThemeId;
    if (comiteId) where.comiteId = comiteId;

    const votes = await prisma.voteQuestion.findMany({
      where,
      include: { options: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(votes);
  },

  async getById(req: Request, res: Response) {
    const vote = await prisma.voteQuestion.findUnique({
      where: { id: req.params.id },
      include: { options: true },
    });
    if (!vote) {
      return res.status(404).json({ error: 'Vote non trouvé' });
    }
    res.json(vote);
  },

  async create(req: Request, res: Response) {
    const { comiteId, themeId, subThemeId, question, options, totalParticipants } = req.body;

    const vote = await prisma.voteQuestion.create({
      data: {
        comiteId,
        themeId,
        subThemeId,
        question,
        totalParticipants,
        options: {
          create: (options || []).map((opt: { text: string }) => ({
            text: opt.text,
            votes: 0,
          })),
        },
      },
      include: { options: true },
    });

    res.status(201).json(vote);
  },

  async castVote(req: Request, res: Response) {
    const { optionId } = req.body;

    const option = await prisma.voteOption.update({
      where: { id: optionId },
      data: {
        votes: { increment: 1 },
      },
    });

    // Retourner le vote complet mis à jour
    const vote = await prisma.voteQuestion.findUnique({
      where: { id: req.params.id },
      include: { options: true },
    });

    res.json(vote);
  },

  async delete(req: Request, res: Response) {
    await prisma.voteQuestion.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  },
};
