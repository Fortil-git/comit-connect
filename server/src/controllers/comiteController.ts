import { Request, Response } from 'express';
import prisma from '../config/database';
import { toDbComiteStatus, formatComiteForFrontend } from '../types';

export const comiteController = {
  async list(req: Request, res: Response) {
    const { status, agencyId } = req.query;
    const where: any = {};

    if (status) {
      where.status = toDbComiteStatus(status as string);
    }

    if (agencyId) {
      where.agencyId = agencyId as string;
    }

    const comites = await prisma.comite.findMany({
      where,
      include: {
        agency: true,
        activities: { orderBy: { timestamp: 'asc' } },
        actions: true,
        voteQuestions: { include: { options: true } },
        autresSujets: true,
      },
      orderBy: { date: 'desc' },
    });

    res.json(comites.map(formatComiteForFrontend));
  },

  async getById(req: Request, res: Response) {
    const comite = await prisma.comite.findUnique({
      where: { id: req.params.id },
      include: {
        agency: true,
        _count: { select: { activities: true, actions: true } },
      },
    });
    if (!comite) {
      return res.status(404).json({ error: 'Comité non trouvé' });
    }
    res.json(formatComiteForFrontend(comite));
  },

  async getFull(req: Request, res: Response) {
    const comite = await prisma.comite.findUnique({
      where: { id: req.params.id },
      include: {
        agency: true,
        activities: { orderBy: { timestamp: 'asc' } },
        actions: { orderBy: { createdAt: 'desc' } },
        voteQuestions: {
          include: { options: true },
          orderBy: { createdAt: 'desc' },
        },
        notes: {
          include: { attachments: true },
        },
        autresSujets: { orderBy: { createdAt: 'desc' } },
        exportHistory: { orderBy: { exportedAt: 'desc' } },
      },
    });
    if (!comite) {
      return res.status(404).json({ error: 'Comité non trouvé' });
    }
    res.json(formatComiteForFrontend(comite));
  },

  async create(req: Request, res: Response) {
    const {
      date, entite, participants, agenceInvites, femmes, hommes,
      postes, ordreJour, invites, formData, agencyId, status,
    } = req.body;

    const comite = await prisma.comite.create({
      data: {
        date: new Date(date),
        entite,
        participants: participants || '',
        agenceInvites,
        femmes: parseInt(femmes) || 0,
        hommes: parseInt(hommes) || 0,
        postes: postes || [],
        ordreJour: ordreJour || '',
        invites,
        formData,
        agencyId,
        status: status ? toDbComiteStatus(status) as any : 'ACTIVE',
      },
    });

    res.status(201).json(formatComiteForFrontend(comite));
  },

  async update(req: Request, res: Response) {
    const {
      date, entite, participants, agenceInvites, femmes, hommes,
      postes, ordreJour, invites, formData,
    } = req.body;

    const data: any = {};
    if (date !== undefined) data.date = new Date(date);
    if (entite !== undefined) data.entite = entite;
    if (participants !== undefined) data.participants = participants;
    if (agenceInvites !== undefined) data.agenceInvites = agenceInvites;
    if (femmes !== undefined) data.femmes = parseInt(femmes) || 0;
    if (hommes !== undefined) data.hommes = parseInt(hommes) || 0;
    if (postes !== undefined) data.postes = postes;
    if (ordreJour !== undefined) data.ordreJour = ordreJour;
    if (invites !== undefined) data.invites = invites;
    if (formData !== undefined) data.formData = formData;

    const comite = await prisma.comite.update({
      where: { id: req.params.id },
      data,
    });

    res.json(formatComiteForFrontend(comite));
  },

  async endSession(req: Request, res: Response) {
    const comite = await prisma.comite.update({
      where: { id: req.params.id },
      data: {
        status: 'CLOSED',
        endedAt: new Date(),
      },
    });
    res.json(formatComiteForFrontend(comite));
  },

  async reopen(req: Request, res: Response) {
    const comite = await prisma.comite.update({
      where: { id: req.params.id },
      data: {
        status: 'ACTIVE',
        endedAt: null,
      },
    });
    res.json(formatComiteForFrontend(comite));
  },

  async delete(req: Request, res: Response) {
    await prisma.comite.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  },
};
