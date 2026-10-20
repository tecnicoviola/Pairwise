import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/prisma';
import { getJwtSecret } from '../config/jwt';
import { AuthenticatedRequest } from '../middleware/auth';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { identifier, password } = loginSchema.parse(req.body);

    const matchmaker = await prisma.matchmaker.findFirst({
      where: {
        OR: [
          { email: { equals: identifier, mode: 'insensitive' } },
          { username: { equals: identifier, mode: 'insensitive' } },
        ],
      },
    });

    if (!matchmaker) {
      res.status(401).json({ error: 'Invalid credentials. Please verify your email/username and password.' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, matchmaker.password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials. Please verify your email/username and password.' });
      return;
    }

    const secret = getJwtSecret();

    const token = jwt.sign(
      {
        id: matchmaker.id,
        email: matchmaker.email,
        username: matchmaker.username,
        name: matchmaker.name,
      },
      secret,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Authentication successful',
      token,
      user: {
        id: matchmaker.id,
        email: matchmaker.email,
        username: matchmaker.username,
        name: matchmaker.name,
        phone: matchmaker.phone,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const matchmaker = await prisma.matchmaker.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        phone: true,
        createdAt: true,
      },
    });

    if (!matchmaker) {
      res.status(404).json({ error: 'Matchmaker profile not found' });
      return;
    }

    res.json({ user: matchmaker });
  } catch (error) {
    next(error);
  }
}

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'Username must be at least 3 characters')
    .max(30)
    .regex(/^[a-z0-9._-]+$/, 'Username may contain letters, numbers, dots, dashes and underscores'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
});

/** Create a matchmaker account and sign the user in immediately. */
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, username, password } = registerSchema.parse(req.body);

    const existing = await prisma.matchmaker.findFirst({
      where: { OR: [{ email }, { username }] },
      select: { email: true },
    });
    if (existing) {
      res.status(409).json({ error: 'An account with this email or username already exists.' });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const matchmaker = await prisma.matchmaker.create({
      data: { name, email, username, password: hashed },
    });

    const token = jwt.sign(
      { id: matchmaker.id, email: matchmaker.email, username: matchmaker.username, name: matchmaker.name },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created',
      token,
      user: {
        id: matchmaker.id,
        email: matchmaker.email,
        username: matchmaker.username,
        name: matchmaker.name,
        phone: matchmaker.phone,
      },
    });
  } catch (error) {
    next(error);
  }
}
