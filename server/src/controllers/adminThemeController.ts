import { Request, Response } from 'express';
import prisma from '../config/database';

export const adminThemeController = {
  async list(_req: Request, res: Response) {
    const themes = await prisma.theme.findMany({
      include: { subThemes: { orderBy: { order: 'asc' } } },
      orderBy: { order: 'asc' },
    });
    res.json(themes);
  },

  async getById(req: Request, res: Response) {
    const theme = await prisma.theme.findUnique({
      where: { id: req.params.id },
      include: { subThemes: { orderBy: { order: 'asc' } } },
    });

    if (!theme) {
      return res.status(404).json({ error: 'Thème non trouvé' });
    }
    res.json(theme);
  },

  async create(req: Request, res: Response) {
    const { id, title, description, icon, color, important, order } = req.body;

    if (!id || !title) {
      return res.status(400).json({ error: 'ID et titre requis' });
    }

    const existing = await prisma.theme.findUnique({ where: { id } });
    if (existing) {
      return res.status(409).json({ error: 'Un thème avec cet ID existe déjà' });
    }

    const theme = await prisma.theme.create({
      data: {
        id,
        title,
        description: description || '',
        icon: icon || 'info',
        color: color || 'from-gray-500 to-gray-600',
        important: important || false,
        order: order ?? 99,
      },
      include: { subThemes: { orderBy: { order: 'asc' } } },
    });

    res.status(201).json(theme);
  },

  async update(req: Request, res: Response) {
    const existing = await prisma.theme.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Thème non trouvé' });
    }

    const { title, description, icon, color, important, order } = req.body;
    const data: any = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (icon !== undefined) data.icon = icon;
    if (color !== undefined) data.color = color;
    if (important !== undefined) data.important = important;
    if (order !== undefined) data.order = order;

    const theme = await prisma.theme.update({
      where: { id: req.params.id },
      data,
      include: { subThemes: { orderBy: { order: 'asc' } } },
    });
    res.json(theme);
  },

  async delete(req: Request, res: Response) {
    const existing = await prisma.theme.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Thème non trouvé' });
    }

    await prisma.theme.delete({ where: { id: req.params.id } });
    res.status(204).send();
  },

  // === Sub-Theme CRUD ===

  async createSubTheme(req: Request, res: Response) {
    const { themeId } = req.params;
    const { id, title, type, options, placeholder, max, order } = req.body;

    if (!title || !type) {
      return res.status(400).json({ error: 'Titre et type requis' });
    }

    const theme = await prisma.theme.findUnique({ where: { id: themeId } });
    if (!theme) {
      return res.status(404).json({ error: 'Thème non trouvé' });
    }

    const slug = id || title
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const existing = await prisma.subTheme.findUnique({ where: { id: slug } });
    if (existing) {
      return res.status(409).json({ error: 'Un sous-thème avec cet ID existe déjà' });
    }

    const subTheme = await prisma.subTheme.create({
      data: {
        id: slug,
        title,
        type,
        options: options || [],
        placeholder: placeholder || null,
        max: max ?? null,
        order: order ?? 0,
        themeId,
      },
    });

    res.status(201).json(subTheme);
  },

  async updateSubTheme(req: Request, res: Response) {
    const { subThemeId } = req.params;

    const existing = await prisma.subTheme.findUnique({ where: { id: subThemeId } });
    if (!existing) {
      return res.status(404).json({ error: 'Sous-thème non trouvé' });
    }

    const { title, type, options, placeholder, max, order } = req.body;
    const data: any = {};
    if (title !== undefined) data.title = title;
    if (type !== undefined) data.type = type;
    if (options !== undefined) data.options = options;
    if (placeholder !== undefined) data.placeholder = placeholder;
    if (max !== undefined) data.max = max;
    if (order !== undefined) data.order = order;

    const subTheme = await prisma.subTheme.update({
      where: { id: subThemeId },
      data,
    });

    res.json(subTheme);
  },

  async deleteSubTheme(req: Request, res: Response) {
    const { subThemeId } = req.params;

    const existing = await prisma.subTheme.findUnique({ where: { id: subThemeId } });
    if (!existing) {
      return res.status(404).json({ error: 'Sous-thème non trouvé' });
    }

    await prisma.subTheme.delete({ where: { id: subThemeId } });
    res.status(204).send();
  },
};
