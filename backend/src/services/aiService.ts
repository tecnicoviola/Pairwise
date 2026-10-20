import OpenAI from 'openai';
import { CustomerProfile, MatchRecommendation } from '../types';

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === '') {
    return null;
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 10000, // 10 second timeout
    });
  }
  return openaiClient;
}

export interface GeneratedDraftResult {
  source: 'ai' | 'fallback';
  draftMessage: string;
  matchExplanation: string;
}

/**
 * Fallback generator when OpenAI API key is missing or call fails.
 * Deterministic, grounded in actual profile data, and respectful.
 */
export function generateDeterministicFallback(
  customer: CustomerProfile,
  candidate: CustomerProfile,
  recommendation: MatchRecommendation
): GeneratedDraftResult {
  const sharedHighlights: string[] = [];
  if (customer.city.toLowerCase() === candidate.city.toLowerCase()) {
    sharedHighlights.push(`both based in ${customer.city}`);
  }
  if (recommendation.positiveReasons.length > 0) {
    sharedHighlights.push(recommendation.positiveReasons.slice(0, 2).join(' and '));
  }

  const highlightSentence =
    sharedHighlights.length > 0
      ? `Our matching analysis highlighted mutual strengths including: ${sharedHighlights.join(', ')}.`
      : 'You share complementary lifestyle values and relationship expectations.';

  const draftMessage = `Hi ${customer.firstName},

I hope your week is going well! I am pleased to introduce you to ${candidate.firstName}, who is a ${candidate.designation} at ${candidate.currentCompany} in ${candidate.city}.

${highlightSentence}

With a mutual compatibility rating of ${recommendation.overallScore}% (${recommendation.compatibilityLabel}), we believe you two would have an engaging and authentic conversation.

Please let me know if you would like me to arrange a mutual introduction, or if you have any questions about ${candidate.firstName}'s profile.

Warm regards,
Your Matchmaking Team at The Date Crew`;

  const matchExplanation = `This match achieves an overall compatibility of ${recommendation.overallScore}% (${recommendation.compatibilityLabel}). Key positive factors: ${
    recommendation.positiveReasons.slice(0, 3).join('; ') || 'Complementary values and timelines'
  }.${
    recommendation.potentialMismatches.length > 0
      ? ` Points to explore during discovery: ${recommendation.potentialMismatches.join('; ')}.`
      : ''
  }`;

  return {
    source: 'fallback',
    draftMessage,
    matchExplanation,
  };
}

/**
 * Generates an AI-grounded introduction draft and explanation using OpenAI,
 * falling back gracefully if unconfigured or on failure.
 */
export async function generateAIIntroductionDraft(
  customer: CustomerProfile,
  candidate: CustomerProfile,
  recommendation: MatchRecommendation
): Promise<GeneratedDraftResult> {
  const client = getOpenAIClient();

  if (!client) {
    return generateDeterministicFallback(customer, candidate, recommendation);
  }

  try {
    const prompt = `You are an expert human matchmaker at 'The Date Crew', an elite, human-first matchmaking agency.
Write an introduction email and concise match explanation for a matchmaker to send to a customer about a recommended candidate.

STRICT GROUNDING RULES:
1. ONLY use facts explicitly provided below. DO NOT invent education, hobbies, or personality traits.
2. DO NOT alter or recalculate the compatibility score (${recommendation.overallScore}%).
3. Do not make exaggerated claims like "you are destined for each other". Keep it warm, refined, discreet, and professional.
4. If an attribute is unknown or missing, do NOT guess it.

Customer:
- Name: ${customer.firstName} ${customer.lastName}
- City: ${customer.city}
- Career: ${customer.designation} at ${customer.currentCompany}
- Relationship Goal: ${customer.relationshipGoals}

Candidate:
- Name: ${candidate.firstName} ${candidate.lastName}
- Age: ${recommendation.candidateSummary.age}
- City: ${candidate.city}
- Degree: ${candidate.degree} (${candidate.undergraduateCollege})
- Career: ${candidate.designation} at ${candidate.currentCompany}
- Diet: ${candidate.diet || 'Not specified'}
- Hobbies: ${candidate.hobbies.join(', ')}

Match Evaluation Facts:
- Mutual Score: ${recommendation.overallScore}% (${recommendation.compatibilityLabel})
- Positive Alignments: ${recommendation.positiveReasons.join('; ')}
- Potential Differences: ${recommendation.potentialMismatches.join('; ') || 'None noted'}

Output format as strict JSON with two keys:
{
  "matchExplanation": "2-3 sentences explaining why this match was recommended, citing actual alignments",
  "draftMessage": "The email draft to ${customer.firstName} introducing ${candidate.firstName}, ready for the matchmaker to review and edit."
}`;

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      const parsed = JSON.parse(content);
      if (parsed.draftMessage && parsed.matchExplanation) {
        return {
          source: 'ai',
          draftMessage: parsed.draftMessage,
          matchExplanation: parsed.matchExplanation,
        };
      }
    }

    return generateDeterministicFallback(customer, candidate, recommendation);
  } catch (err) {
    console.warn('OpenAI API call failed or timed out. Using deterministic fallback.', err);
    return generateDeterministicFallback(customer, candidate, recommendation);
  }
}
