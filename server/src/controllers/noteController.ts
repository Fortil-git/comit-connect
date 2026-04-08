import { Request, Response } from 'express';
import prisma from '../config/database';

export const noteController = {
  async get(req: Request, res: Response) {
    const { themeId, subThemeId, comiteId } = req.query;

    if (!themeId || !subThemeId) {
      return res.status(400).json({ error: 'themeId et subThemeId sont requis' });
    }

    const where: any = {
      themeId: themeId as string,
      subThemeId: subThemeId as string,
    };
    if (comiteId) where.comiteId = comiteId as string;

    const note = await prisma.note.findFirst({
      where,
      include: { attachments: true },
    });

    res.json(note);
  },

  async getByTheme(req: Request, res: Response) {
    const { themeId, comiteId } = req.query;

    if (!themeId) {
      return res.status(400).json({ error: 'themeId est requis' });
    }

    const where: any = { themeId: themeId as string };
    if (comiteId) where.comiteId = comiteId as string;

    const notes = await prisma.note.findMany({
      where,
      include: { attachments: true },
    });

    // Retourner au format { [subThemeId]: { content, attachments } }
    const result: Record<string, any> = {};
    for (const note of notes) {
      result[note.subThemeId] = {
        content: note.content,
        attachments: note.attachments,
      };
    }

    res.json(result);
  },

  async upsert(req: Request, res: Response) {
    const { comiteId, themeId, subThemeId, content } = req.body;

    if (!themeId || !subThemeId) {
      return res.status(400).json({ error: 'themeId et subThemeId sont requis' });
    }

    const note = await prisma.note.upsert({
      where: {
        comiteId_themeId_subThemeId: {
          comiteId: comiteId || '',
          themeId,
          subThemeId,
        },
      },
      update: { content: content || '' },
      create: {
        comiteId,
        themeId,
        subThemeId,
        content: content || '',
      },
      include: { attachments: true },
    });

    res.json(note);
  },

  async update(req: Request, res: Response) {
    const { content } = req.body;

    const note = await prisma.note.update({
      where: { id: req.params.id },
      data: { content },
      include: { attachments: true },
    });

    res.json(note);
  },

  async delete(req: Request, res: Response) {
    await prisma.note.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  },

  // Attachments
  async addAttachment(req: Request, res: Response) {
    const { name, size, data } = req.body;

    const attachment = await prisma.attachment.create({
      data: {
        noteId: req.params.id,
        name,
        size,
        data,
      },
    });

    res.status(201).json(attachment);
  },

  async listAttachments(req: Request, res: Response) {
    const attachments = await prisma.attachment.findMany({
      where: { noteId: req.params.id },
    });
    res.json(attachments);
  },

  async deleteAttachment(req: Request, res: Response) {
    await prisma.attachment.delete({
      where: { id: req.params.attachmentId },
    });
    res.status(204).send();
  },
};
