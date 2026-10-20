import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { canAccessCustomer } from '../utils/access';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

const createNoteSchema = z.object({
  content: z.string().min(1, 'Note content cannot be empty'),
  category: z.enum(['CALL', 'MEETING', 'FOLLOW_UP', 'GENERAL']).default('GENERAL'),
});

export async function getNotes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const customerId = req.params.id as string;

    if (!(await canAccessCustomer(customerId, req.user?.id))) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    const notes = await prisma.note.findMany({
      where: { customerId },
      include: {
        matchmaker: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ data: notes });
  } catch (error) {
    next(error);
  }
}

export async function createNote(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const customerId = req.params.id as string;
    const matchmakerId = req.user?.id;

    if (!matchmakerId) {
      res.status(401).json({ error: 'Authenticated matchmaker ID required' });
      return;
    }

    const { content, category } = createNoteSchema.parse(req.body);

    if (!(await canAccessCustomer(customerId, matchmakerId))) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    const [note] = await prisma.$transaction([
      prisma.note.create({
        data: {
          customerId,
          matchmakerId,
          content,
          category,
        },
        include: {
          matchmaker: {
            select: { id: true, name: true },
          },
        },
      }),
      // Update customer lastContactDate if it was a call or meeting
      prisma.customer.update({
        where: { id: customerId },
        data: {
          lastContactDate: new Date(),
        },
      }),
      // Record activity event
      prisma.activityEvent.create({
        data: {
          customerId,
          matchmakerId,
          eventType: 'NOTE_ADDED',
          description: `Added ${category} note: "${content.slice(0, 60)}${content.length > 60 ? '...' : ''}"`,
        },
      }),
    ]);

    res.status(201).json({
      message: 'Note created successfully',
      data: note,
    });
  } catch (error) {
    next(error);
  }
}
