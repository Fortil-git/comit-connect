import { Request, Response } from 'express';
import prisma from '../config/database';
import crypto from 'crypto';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateId(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 25);
}

export const adminUserController = {
  async list(req: Request, res: Response) {
    const { search, role, agencyId } = req.query;
    const where: any = {};

    if (search && typeof search === 'string') {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role && role !== 'all') {
      where.userRole = role;
    }
    if (agencyId && agencyId !== 'all') {
      where.agencyId = agencyId;
    }

    const persons = await prisma.person.findMany({
      where,
      include: { agency: true },
      orderBy: { fullName: 'asc' },
    });

    res.json(persons.map(({ password, ...rest }) => rest));
  },

  async getById(req: Request, res: Response) {
    const person = await prisma.person.findUnique({
      where: { id: req.params.id },
      include: { agency: true },
    });

    if (!person) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const { password, ...rest } = person;
    res.json(rest);
  },

  async create(req: Request, res: Response) {
    const { firstName, lastName, email, jobTitle, userRole, agencyId, password } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: 'Prénom, nom et email requis' });
    }

    const existing = await prisma.person.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }

    const person = await prisma.person.create({
      data: {
        id: generateId(),
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        email,
        jobTitle: jobTitle || null,
        userRole: userRole || 'UTILISATEUR',
        agencyId: agencyId || null,
        password: hashPassword(password || 'password'),
        isActive: true,
      },
      include: { agency: true },
    });

    const { password: _, ...result } = person;
    res.status(201).json(result);
  },

  async update(req: Request, res: Response) {
    const { firstName, lastName, email, jobTitle, userRole, agencyId, isActive, password } = req.body;

    const existing = await prisma.person.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (email && email !== existing.email) {
      const emailTaken = await prisma.person.findUnique({ where: { email } });
      if (emailTaken) {
        return res.status(409).json({ error: 'Cet email est déjà utilisé' });
      }
    }

    const data: any = {};
    if (firstName !== undefined) data.firstName = firstName;
    if (lastName !== undefined) data.lastName = lastName;
    if (firstName !== undefined || lastName !== undefined) {
      data.fullName = `${firstName ?? existing.firstName} ${lastName ?? existing.lastName}`;
    }
    if (email !== undefined) data.email = email;
    if (jobTitle !== undefined) data.jobTitle = jobTitle;
    if (userRole !== undefined) data.userRole = userRole;
    if (agencyId !== undefined) data.agencyId = agencyId || null;
    if (isActive !== undefined) data.isActive = isActive;
    if (password) data.password = hashPassword(password);

    const person = await prisma.person.update({
      where: { id: req.params.id },
      data,
      include: { agency: true },
    });

    const { password: _, ...result } = person;
    res.json(result);
  },

  async delete(req: Request, res: Response) {
    const existing = await prisma.person.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    await prisma.person.delete({ where: { id: req.params.id } });
    res.status(204).send();
  },

  async toggleActive(req: Request, res: Response) {
    const person = await prisma.person.findUnique({ where: { id: req.params.id } });
    if (!person) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const updated = await prisma.person.update({
      where: { id: req.params.id },
      data: { isActive: !person.isActive },
      include: { agency: true },
    });

    const { password: _, ...result } = updated;
    res.json(result);
  },
};
