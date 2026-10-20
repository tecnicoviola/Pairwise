import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { canAccessCustomer } from '../utils/access';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import {
  generateRecommendations,
  calculateAge,
} from '../services/matchingEngine';
import { generateAIIntroductionDraft } from '../services/aiService';
import { CustomerProfile } from '../types';

export async function getCustomerMatches(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const customerId = req.params.id as string;

    if (!(await canAccessCustomer(customerId, req.user?.id))) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    const matches = await prisma.match.findMany({
      where: { customerId },
      include: {
        candidate: {
          include: {
            partnerPreferences: true,
          },
        },
      },
      orderBy: { overallScore: 'desc' },
    });

    const matchesWithAge = matches.map((m: any) => ({
      ...m,
      candidate: {
        ...m.candidate,
        age: calculateAge(m.candidate.dateOfBirth),
      },
    }));

    res.json({ data: matchesWithAge });
  } catch (error) {
    next(error);
  }
}

export async function generateMatches(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const customerId = req.params.id as string;
    const { requireVerifiedOnly = false, limit = 20 } = req.body ?? {};

    if (!(await canAccessCustomer(customerId, req.user?.id))) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    // Fetch customer with partner preferences
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { partnerPreferences: true },
    });

    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    // Determine opposite gender for supported matchmaking scenario
    const oppositeGender = customer.gender === 'MALE' ? 'FEMALE' : customer.gender === 'FEMALE' ? 'MALE' : undefined;

    // Fetch candidate pool
    const candidatePool = await prisma.customer.findMany({
      where: {
        id: { not: customerId },
        journeyStage: { not: 'CLOSED' },
        ...(oppositeGender ? { gender: oppositeGender } : {}),
      },
      include: { partnerPreferences: true },
    });

    // Check previously introduced or rejected matches to exclude them if needed
    const existingMatches = await prisma.match.findMany({
      where: {
        customerId,
        status: { in: ['SENT', 'DECLINED', 'CLOSED'] },
      },
      select: { candidateId: true },
    });
    const excludedCandidateIds = existingMatches.map((m: any) => m.candidateId);

    // Run deterministic TypeScript matching engine
    const recommendations = generateRecommendations(
      customer as unknown as CustomerProfile,
      candidatePool as unknown as CustomerProfile[],
      {
        limit: Number(limit) || 20,
        requireVerifiedOnly: Boolean(requireVerifiedOnly),
        excludedCandidateIds,
      }
    );

    // Upsert or persist recommendations into database for match tracking
    for (const rec of recommendations) {
      await prisma.match.upsert({
        where: {
          customerId_candidateId: {
            customerId,
            candidateId: rec.candidateId,
          },
        },
        create: {
          customerId,
          candidateId: rec.candidateId,
          overallScore: rec.overallScore,
          customerToCandidateScore: rec.customerToCandidateScore,
          candidateToCustomerScore: rec.candidateToCustomerScore,
          compatibilityLabel: rec.compatibilityLabel,
          positiveReasons: rec.positiveReasons,
          potentialMismatches: rec.potentialMismatches,
          unknownDetails: rec.unknownDetails,
          status: 'SUGGESTED',
          aiExplanation: rec.conciseExplanation,
        },
        update: {
          overallScore: rec.overallScore,
          customerToCandidateScore: rec.customerToCandidateScore,
          candidateToCustomerScore: rec.candidateToCustomerScore,
          compatibilityLabel: rec.compatibilityLabel,
          positiveReasons: rec.positiveReasons,
          potentialMismatches: rec.potentialMismatches,
          unknownDetails: rec.unknownDetails,
          aiExplanation: rec.conciseExplanation,
        },
      });
    }

    // Drop stale suggestions from earlier runs that are not part of this run
    // (e.g. unverified candidates after re-running with "Strict Verified Only").
    // Matches that were already sent, accepted, declined, etc. are kept as history.
    await prisma.match.deleteMany({
      where: {
        customerId,
        status: 'SUGGESTED',
        candidateId: { notIn: recommendations.map((r) => r.candidateId) },
      },
    });

    // Advance the journey stage once suggestions exist for a customer who was ready for matches
    if (recommendations.length > 0 && customer.journeyStage === 'READY_FOR_MATCHES') {
      await prisma.customer.update({
        where: { id: customerId },
        data: { journeyStage: 'MATCH_SUGGESTED' },
      });
    }

    // Record activity
    await prisma.activityEvent.create({
      data: {
        customerId,
        matchmakerId: req.user?.id,
        eventType: 'MATCH_SUGGESTED',
        description: `Generated ${recommendations.length} ranked match recommendations`,
      },
    });

    res.json({
      message: `Generated ${recommendations.length} recommendations successfully`,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMatchById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;

    const match: any = await prisma.match.findUnique({
      where: { id },
      include: {
        customer: true,
        candidate: {
          include: { partnerPreferences: true },
        },
      },
    });

    if (!match || !(await canAccessCustomer(match.customerId, req.user?.id))) {
      res.status(404).json({ error: 'Match record not found' });
      return;
    }

    res.json({
      data: {
        ...match,
        candidate: {
          ...match.candidate,
          age: calculateAge(match.candidate.dateOfBirth),
        },
        customer: {
          ...match.customer,
          age: calculateAge(match.customer.dateOfBirth),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function generateDraft(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;

    const match: any = await prisma.match.findUnique({
      where: { id },
      include: {
        customer: { include: { partnerPreferences: true } },
        candidate: { include: { partnerPreferences: true } },
      },
    });

    if (!match || !(await canAccessCustomer(match.customerId, req.user?.id))) {
      res.status(404).json({ error: 'Match record not found' });
      return;
    }

    if (match.status === 'SENT') {
      res.status(409).json({ error: 'This introduction has already been sent.' });
      return;
    }

    const candidateAge = calculateAge(match.candidate.dateOfBirth);

    const recStructure = {
      candidateId: match.candidate.id,
      candidateSummary: {
        id: match.candidate.id,
        firstName: match.candidate.firstName,
        lastName: match.candidate.lastName,
        age: candidateAge,
        gender: match.candidate.gender,
        city: match.candidate.city,
        country: match.candidate.country,
        designation: match.candidate.designation,
        currentCompany: match.candidate.currentCompany,
        degree: match.candidate.degree,
        height: match.candidate.height,
        verificationStatus: match.candidate.verificationStatus,
        journeyStage: match.candidate.journeyStage,
      },
      overallScore: match.overallScore,
      customerToCandidateScore: match.customerToCandidateScore,
      candidateToCustomerScore: match.candidateToCustomerScore,
      compatibilityLabel: match.compatibilityLabel as any,
      positiveReasons: match.positiveReasons,
      potentialMismatches: match.potentialMismatches,
      unknownDetails: match.unknownDetails,
      verificationStatus: match.candidate.verificationStatus,
      conciseExplanation: match.aiExplanation || '',
      directionalBreakdowns: {
        customerToCandidate: [],
        candidateToCustomer: [],
      },
    };

    const draftResult = await generateAIIntroductionDraft(
      match.customer as unknown as CustomerProfile,
      match.candidate as unknown as CustomerProfile,
      recStructure
    );

    // Save generated draft and explanation to database
    await prisma.match.update({
      where: { id },
      data: {
        introductionDraft: draftResult.draftMessage,
        aiExplanation: draftResult.matchExplanation,
      },
    });

    res.json({
      data: draftResult,
    });
  } catch (error) {
    next(error);
  }
}

const sendMatchSchema = z.object({
  introductionMessage: z.string().min(10, 'Introduction message must be at least 10 characters'),
});

export async function sendMatch(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { introductionMessage } = sendMatchSchema.parse(req.body);

    const match: any = await prisma.match.findUnique({
      where: { id },
      include: {
        customer: true,
        candidate: true,
      },
    });

    if (!match || !(await canAccessCustomer(match.customerId, req.user?.id))) {
      res.status(404).json({ error: 'Match record not found' });
      return;
    }

    // Only SUGGESTED / APPROVED matches may be sent
    if (!['SUGGESTED', 'APPROVED'].includes(match.status)) {
      res.status(409).json({
        error: match.status === 'SENT'
          ? 'This introduction has already been sent to the customer.'
          : `A match with status ${match.status} cannot be sent.`,
      });
      return;
    }

    const now = new Date();

    // Atomic guard: the status filter makes concurrent duplicate sends a no-op
    const claimed = await prisma.match.updateMany({
      where: { id, status: { in: ['SUGGESTED', 'APPROVED'] } },
      data: { status: 'SENT', sentAt: now, introductionDraft: introductionMessage },
    });
    if (claimed.count === 0) {
      res.status(409).json({ error: 'This introduction has already been sent to the customer.' });
      return;
    }

    const [updatedMatch] = await prisma.$transaction([
      prisma.match.findUniqueOrThrow({ where: { id } }),
      // Progress customer journey stage if currently in ready or suggested
      prisma.customer.update({
        where: { id: match.customerId },
        data: {
          journeyStage: 'INTRODUCTION_SENT',
          lastContactDate: now,
        },
      }),
      // Record activity event
      prisma.activityEvent.create({
        data: {
          customerId: match.customerId,
          matchmakerId: req.user?.id,
          eventType: 'INTRODUCTION_SENT',
          description: `Sent personalized introduction to ${match.customer.firstName} for candidate ${match.candidate.firstName} ${match.candidate.lastName}`,
          metadata: {
            matchId: id,
            candidateId: match.candidateId,
            score: match.overallScore,
          },
        },
      }),
    ]);

    res.json({
      message: 'Mock introduction recorded and sent successfully',
      data: updatedMatch,
    });
  } catch (error) {
    next(error);
  }
}
