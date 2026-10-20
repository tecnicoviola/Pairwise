import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { canAccessCustomer } from '../utils/access';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { calculateAge } from '../services/matchingEngine';

export async function getCustomers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const matchmakerId = req.user?.id;
    const {
      search,
      journeyStage,
      verificationStatus,
      city,
      gender,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = '1',
      limit = '15',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const take = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 15));
    const skip = (pageNum - 1) * take;

    const whereClause: any = {};

    // Matchmakers can view customers assigned to them or unassigned leads
    if (matchmakerId) {
      whereClause.OR = [
        { matchmakerId },
        { matchmakerId: null },
      ];
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim();
      whereClause.AND = [
        {
          OR: [
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
            { city: { contains: q, mode: 'insensitive' } },
            { currentCompany: { contains: q, mode: 'insensitive' } },
            { designation: { contains: q, mode: 'insensitive' } },
          ],
        },
      ];
    }

    if (journeyStage && typeof journeyStage === 'string' && journeyStage !== 'ALL') {
      whereClause.journeyStage = journeyStage;
    }

    if (verificationStatus && typeof verificationStatus === 'string' && verificationStatus !== 'ALL') {
      whereClause.verificationStatus = verificationStatus;
    }

    if (city && typeof city === 'string' && city !== 'ALL') {
      whereClause.city = { contains: city, mode: 'insensitive' };
    }

    if (gender && typeof gender === 'string' && gender !== 'ALL') {
      whereClause.gender = gender;
    }

    let orderByClause: any = { createdAt: 'desc' };
    if (sortBy === 'name') {
      orderByClause = { firstName: sortOrder === 'asc' ? 'asc' : 'desc' };
    } else if (sortBy === 'lastContactDate') {
      orderByClause = { lastContactDate: sortOrder === 'asc' ? 'asc' : 'desc' };
    } else if (sortBy === 'age' || sortBy === 'dateOfBirth') {
      // Inverted: older = earlier date of birth
      orderByClause = { dateOfBirth: sortOrder === 'asc' ? 'desc' : 'asc' };
    }

    const [total, customers] = await Promise.all([
      prisma.customer.count({ where: whereClause }),
      prisma.customer.findMany({
        where: whereClause,
        include: {
          partnerPreferences: true,
          matchmaker: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: {
              notes: true,
              initiatedMatches: true,
            },
          },
        },
        orderBy: orderByClause,
        skip,
        take,
      }),
    ]);

    // Attach calculated age
    const customersWithAge = customers.map((c: any) => ({
      ...c,
      age: calculateAge(c.dateOfBirth),
    }));

    // Summary statistics for the matchmaker
    const statsWhere = matchmakerId
      ? { OR: [{ matchmakerId }, { matchmakerId: null }] }
      : {};

    const [totalAssigned, verifiedCount, readyForMatchesCount, pendingFollowUpCount] =
      await Promise.all([
        prisma.customer.count({ where: statsWhere }),
        prisma.customer.count({
          where: { ...statsWhere, verificationStatus: 'VERIFIED' },
        }),
        prisma.customer.count({
          where: { ...statsWhere, journeyStage: 'READY_FOR_MATCHES' },
        }),
        prisma.customer.count({
          where: { ...statsWhere, journeyStage: 'FOLLOW_UP_REQUIRED' },
        }),
      ]);

    res.json({
      data: customersWithAge,
      pagination: {
        page: pageNum,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
      stats: {
        totalCustomers: totalAssigned,
        verifiedProfiles: verifiedCount,
        readyForMatches: readyForMatchesCount,
        pendingFollowUps: pendingFollowUpCount,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getCustomerById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;

    if (!(await canAccessCustomer(id, req.user?.id))) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        partnerPreferences: true,
        matchmaker: {
          select: { id: true, name: true, email: true },
        },
        notes: {
          include: {
            matchmaker: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        initiatedMatches: {
          include: {
            candidate: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                gender: true,
                city: true,
                designation: true,
                currentCompany: true,
                verificationStatus: true,
                dateOfBirth: true,
              },
            },
          },
          orderBy: { overallScore: 'desc' },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    const age = calculateAge(customer.dateOfBirth);

    res.json({
      data: {
        ...customer,
        age,
      },
    });
  } catch (error) {
    next(error);
  }
}

const updateCustomerSchema = z.object({
  journeyStage: z
    .enum([
      'NEW_LEAD',
      'ONBOARDING',
      'PROFILE_INCOMPLETE',
      'VERIFICATION_PENDING',
      'PROFILE_VERIFIED',
      'READY_FOR_MATCHES',
      'MATCH_SUGGESTED',
      'INTRODUCTION_SENT',
      'FEEDBACK_PENDING',
      'FOLLOW_UP_REQUIRED',
      'CLOSED',
    ])
    .optional(),
  verificationStatus: z
    .enum(['UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED'])
    .optional(),
  lastContactDate: z.string().datetime().optional(),
});

export async function updateCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const body = updateCustomerSchema.parse(req.body);

    if (!(await canAccessCustomer(id, req.user?.id))) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        ...(body.journeyStage ? { journeyStage: body.journeyStage } : {}),
        ...(body.verificationStatus ? { verificationStatus: body.verificationStatus } : {}),
        ...(body.lastContactDate ? { lastContactDate: new Date(body.lastContactDate) } : {}),
      },
    });

    // Record activity event
    if (body.journeyStage && body.journeyStage !== existing.journeyStage) {
      await prisma.activityEvent.create({
        data: {
          customerId: id,
          matchmakerId: req.user?.id,
          eventType: 'STAGE_CHANGED',
          description: `Journey stage progressed from ${existing.journeyStage} to ${body.journeyStage}`,
        },
      });
    }

    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
}
