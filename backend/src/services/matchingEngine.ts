import {
  CustomerProfile,
  MatchRecommendation,
  DirectionalFitResult,
  DimensionBreakdown,
  PartnerPreferencesProfile,
} from '../types';

export interface MatchingOptions {
  limit?: number;
  excludedCandidateIds?: string[];
  requireVerifiedOnly?: boolean;
}

export function calculateAge(dateOfBirth: string | Date): number {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

/**
 * Stage A: Eligibility Filter
 * Filters out completely ineligible candidates before scoring.
 */
export function isEligibleCandidate(
  customer: CustomerProfile,
  candidate: CustomerProfile,
  options: MatchingOptions = {}
): { eligible: boolean; reason?: string } {
  // 1. Exclude self
  if (customer.id === candidate.id) {
    return { eligible: false, reason: 'Candidate is the customer themselves' };
  }

  // 2. Journey Stage: Exclude closed / opted-out
  if (candidate.journeyStage === 'CLOSED') {
    return { eligible: false, reason: 'Candidate profile is closed' };
  }

  // 3. Exclude explicitly rejected / previously introduced candidates
  if (options.excludedCandidateIds && options.excludedCandidateIds.includes(candidate.id)) {
    return { eligible: false, reason: 'Candidate already introduced or excluded' };
  }

  // 4. Verification requirement check
  if (options.requireVerifiedOnly && candidate.verificationStatus !== 'VERIFIED') {
    return { eligible: false, reason: 'Candidate is not verified' };
  }

  // 5. Gender matching rules
  // Standard opposite-gender matchmaking scenario supported by default
  if (customer.gender === 'MALE' && candidate.gender !== 'FEMALE') {
    return { eligible: false, reason: 'Gender mismatch (Customer seeks Female)' };
  }
  if (customer.gender === 'FEMALE' && candidate.gender !== 'MALE') {
    return { eligible: false, reason: 'Gender mismatch (Customer seeks Male)' };
  }

  const candidateAge = calculateAge(candidate.dateOfBirth);
  const customerAge = calculateAge(customer.dateOfBirth);

  // 6. Hard age dealbreakers if specified
  const custPref = customer.partnerPreferences;
  if (custPref?.preferredAgeMin && candidateAge < custPref.preferredAgeMin) {
    return { eligible: false, reason: `Candidate age (${candidateAge}) is below customer minimum (${custPref.preferredAgeMin})` };
  }
  if (custPref?.preferredAgeMax && candidateAge > custPref.preferredAgeMax) {
    return { eligible: false, reason: `Candidate age (${candidateAge}) exceeds customer maximum (${custPref.preferredAgeMax})` };
  }

  // Candidate's own age preference check against customer
  const candPref = candidate.partnerPreferences;
  if (candPref?.preferredAgeMin && customerAge < candPref.preferredAgeMin) {
    return { eligible: false, reason: `Customer age (${customerAge}) is below candidate minimum (${candPref.preferredAgeMin})` };
  }
  if (candPref?.preferredAgeMax && customerAge > candPref.preferredAgeMax) {
    return { eligible: false, reason: `Customer age (${customerAge}) exceeds candidate maximum (${candPref.preferredAgeMax})` };
  }

  // 7. Marital status dealbreakers if explicitly configured
  if (custPref?.preferredMaritalStatus && custPref.preferredMaritalStatus.length > 0) {
    if (!custPref.preferredMaritalStatus.includes(candidate.maritalStatus)) {
      return { eligible: false, reason: `Candidate marital status (${candidate.maritalStatus}) not in preferred list` };
    }
  }

  return { eligible: true };
}

/**
 * Stage B: Directional Compatibility Scoring (0 to 100)
 * Evaluates how well Person B satisfies Person A's preferences and profile.
 * Weights total exactly 100 points.
 */
export function evaluateDirectionalFit(
  seeker: CustomerProfile,
  candidate: CustomerProfile
): DirectionalFitResult {
  const breakdowns: DimensionBreakdown[] = [];
  const positivePoints: string[] = [];
  const mismatches: string[] = [];
  const unknowns: string[] = [];

  const pref = seeker.partnerPreferences;
  const candidateAge = calculateAge(candidate.dateOfBirth);
  const seekerAge = calculateAge(seeker.dateOfBirth);

  // Dimension 1: Values & Relationship Goals (15 pts)
  let valuesScore = 0;
  if (seeker.relationshipGoals && candidate.relationshipGoals) {
    if (seeker.relationshipGoals.toLowerCase() === candidate.relationshipGoals.toLowerCase()) {
      valuesScore = 15;
      positivePoints.push(`Both share the same relationship timeline (${seeker.relationshipGoals})`);
      breakdowns.push({
        dimension: 'Relationship Goals & Values',
        maxScore: 15,
        earnedScore: 15,
        details: `Aligned goals: ${seeker.relationshipGoals}`,
        status: 'match',
      });
    } else {
      valuesScore = 8;
      breakdowns.push({
        dimension: 'Relationship Goals & Values',
        maxScore: 15,
        earnedScore: 8,
        details: `Differing timelines (${seeker.relationshipGoals} vs ${candidate.relationshipGoals})`,
        status: 'partial',
      });
    }
  } else {
    valuesScore = 7;
    unknowns.push('Relationship goals partially unstated');
    breakdowns.push({
      dimension: 'Relationship Goals & Values',
      maxScore: 15,
      earnedScore: 7,
      details: 'Incomplete timeline information',
      status: 'unknown',
    });
  }

  // Dimension 2: Children & Family Expectations (15 pts)
  // Assessment specific: Alignment on children is particularly critical
  let childrenScore = 0;
  const preferredChildren = pref?.preferredChildren || seeker.wantChildren;
  if (preferredChildren && candidate.wantChildren) {
    if (preferredChildren === candidate.wantChildren) {
      childrenScore = 15;
      positivePoints.push(`Strong alignment on children preference (${candidate.wantChildren})`);
      breakdowns.push({
        dimension: 'Children & Family Expectations',
        maxScore: 15,
        earnedScore: 15,
        details: `Mutual children alignment: ${candidate.wantChildren}`,
        status: 'match',
      });
    } else if (preferredChildren === 'MAYBE' || candidate.wantChildren === 'MAYBE') {
      childrenScore = 10;
      breakdowns.push({
        dimension: 'Children & Family Expectations',
        maxScore: 15,
        earnedScore: 10,
        details: `Flexible on children: ${preferredChildren} vs ${candidate.wantChildren}`,
        status: 'partial',
      });
    } else {
      childrenScore = 0;
      mismatches.push(`Direct mismatch on children: Seeker wants ${preferredChildren}, candidate chose ${candidate.wantChildren}`);
      breakdowns.push({
        dimension: 'Children & Family Expectations',
        maxScore: 15,
        earnedScore: 0,
        details: `Opposing views on children: ${preferredChildren} vs ${candidate.wantChildren}`,
        status: 'mismatch',
      });
    }
  } else {
    childrenScore = 7;
    unknowns.push('Children expectation unconfirmed');
    breakdowns.push({
      dimension: 'Children & Family Expectations',
      maxScore: 15,
      earnedScore: 7,
      details: 'Unconfirmed children plans',
      status: 'unknown',
    });
  }

  // Dimension 3: Location & Relocation (15 pts)
  let locationScore = 0;
  const sameCity = seeker.city.toLowerCase() === candidate.city.toLowerCase();
  const preferredCities = pref?.preferredCities || [];
  const cityMatch = preferredCities.some((c) => c.toLowerCase() === candidate.city.toLowerCase());

  if (sameCity || cityMatch) {
    locationScore = 15;
    positivePoints.push(`Based in preferred location (${candidate.city})`);
    breakdowns.push({
      dimension: 'Location & Relocation',
      maxScore: 15,
      earnedScore: 15,
      details: `In preferred city: ${candidate.city}`,
      status: 'match',
    });
  } else if (candidate.openToRelocation === 'YES' || seeker.openToRelocation === 'YES') {
    locationScore = 11;
    positivePoints.push(`Open to relocation (${candidate.city} to ${seeker.city})`);
    breakdowns.push({
      dimension: 'Location & Relocation',
      maxScore: 15,
      earnedScore: 11,
      details: `Different cities but open to relocation`,
      status: 'partial',
    });
  } else if (candidate.openToRelocation === 'MAYBE' || seeker.openToRelocation === 'MAYBE') {
    locationScore = 8;
    breakdowns.push({
      dimension: 'Location & Relocation',
      maxScore: 15,
      earnedScore: 8,
      details: `Different cities, relocation open for discussion`,
      status: 'partial',
    });
  } else {
    locationScore = 3;
    mismatches.push(`Different cities (${seeker.city} vs ${candidate.city}) with no openness to relocate`);
    breakdowns.push({
      dimension: 'Location & Relocation',
      maxScore: 15,
      earnedScore: 3,
      details: `Location barrier: ${seeker.city} vs ${candidate.city}`,
      status: 'mismatch',
    });
  }

  // Dimension 4: Career, Education & Income (15 pts)
  // Assessment specific requirement:
  // - Female customers: emphasize profession, career trajectory, education
  // - Male customers: consider income alignment (e.g. earning parity or less per assessment prompt)
  let careerScore = 0;
  const isFemaleSeeker = seeker.gender === 'FEMALE';
  const isMaleSeeker = seeker.gender === 'MALE';

  let eduPoints = 0;
  if (pref?.preferredEducation && pref.preferredEducation.length > 0) {
    if (pref.preferredEducation.some((e) => candidate.degree.toLowerCase().includes(e.toLowerCase()))) {
      eduPoints = 5;
    }
  } else if (candidate.degree) {
    eduPoints = 4;
  }

  let profPoints = 0;
  if (pref?.preferredProfessions && pref.preferredProfessions.length > 0) {
    if (pref.preferredProfessions.some((p) => candidate.designation.toLowerCase().includes(p.toLowerCase()))) {
      profPoints = 6;
      positivePoints.push(`Profession aligns with preference: ${candidate.designation}`);
    } else {
      profPoints = 3;
    }
  } else {
    profPoints = 4;
  }

  let incomePoints = 0;
  if (pref?.preferredIncomeMin) {
    if (candidate.income >= pref.preferredIncomeMin) {
      incomePoints = 4;
    } else {
      incomePoints = 1;
      mismatches.push(`Candidate income below stated preference (${pref.preferredIncomeMin})`);
    }
  } else if (isMaleSeeker) {
    // Assessment requirement for male customers: "consider women who earn less"
    if (candidate.income <= seeker.income) {
      incomePoints = 4;
      positivePoints.push(`Income profile aligned with traditional partner expectation`);
    } else {
      // Still positive, just neutral 3 points
      incomePoints = 3;
    }
  } else if (isFemaleSeeker) {
    // Female customers: emphasize professional stability and parity
    if (candidate.income >= seeker.income * 0.8) {
      incomePoints = 4;
      positivePoints.push(`Strong professional and financial standing (${candidate.designation} at ${candidate.currentCompany})`);
    } else {
      incomePoints = 2;
    }
  } else {
    incomePoints = 3;
  }

  careerScore = Math.min(15, eduPoints + profPoints + incomePoints);
  breakdowns.push({
    dimension: 'Career, Education & Profession',
    maxScore: 15,
    earnedScore: careerScore,
    details: `${candidate.degree} · ${candidate.designation} at ${candidate.currentCompany}`,
    status: careerScore >= 12 ? 'match' : careerScore >= 7 ? 'partial' : 'mismatch',
  });

  // Dimension 5: Language & Cultural Background (10 pts)
  let langScore = 0;
  const sharedLanguages = seeker.languagesKnown.filter((l) =>
    candidate.languagesKnown.some((cl) => cl.toLowerCase() === l.toLowerCase())
  );
  const sameMotherTongue = seeker.motherTongue.toLowerCase() === candidate.motherTongue.toLowerCase();

  if (sameMotherTongue && sharedLanguages.length > 0) {
    langScore = 10;
    positivePoints.push(`Shared mother tongue (${candidate.motherTongue}) and fluent communication`);
  } else if (sharedLanguages.length > 0) {
    langScore = 8;
    positivePoints.push(`Shared spoken languages: ${sharedLanguages.join(', ')}`);
  } else {
    langScore = 3;
    mismatches.push('No common fluent language listed');
  }

  breakdowns.push({
    dimension: 'Language & Cultural Background',
    maxScore: 10,
    earnedScore: langScore,
    details: sameMotherTongue ? `Shared mother tongue: ${candidate.motherTongue}` : `Common languages: ${sharedLanguages.join(', ') || 'None'}`,
    status: langScore >= 8 ? 'match' : 'partial',
  });

  // Dimension 6: Age & Height Preferences (15 pts)
  // Assessment specific:
  // - Male customers: consider women who are younger and shorter
  let ageHeightScore = 0;
  let ageScore = 0;
  let heightScore = 0;

  // Age score (max 8)
  if (pref?.preferredAgeMin && pref?.preferredAgeMax) {
    if (candidateAge >= pref.preferredAgeMin && candidateAge <= pref.preferredAgeMax) {
      ageScore = 8;
      positivePoints.push(`Within preferred age range (${candidateAge} years old)`);
    } else {
      ageScore = 2;
    }
  } else if (isMaleSeeker) {
    // Default male assessment assumption: younger woman
    if (candidateAge <= seekerAge && candidateAge >= seekerAge - 7) {
      ageScore = 8;
      positivePoints.push(`Complimentary age profile (${candidateAge} yrs vs ${seekerAge} yrs)`);
    } else if (candidateAge > seekerAge) {
      ageScore = 4;
    } else {
      ageScore = 5;
    }
  } else if (isFemaleSeeker) {
    // Female assessment assumption: peer or slightly older
    if (candidateAge >= seekerAge - 2 && candidateAge <= seekerAge + 6) {
      ageScore = 8;
      positivePoints.push(`Complimentary age profile (${candidateAge} yrs vs ${seekerAge} yrs)`);
    } else {
      ageScore = 5;
    }
  } else {
    ageScore = 6;
  }

  // Height score (max 7)
  if (pref?.preferredHeightMin && pref?.preferredHeightMax) {
    if (candidate.height >= pref.preferredHeightMin && candidate.height <= pref.preferredHeightMax) {
      heightScore = 7;
      positivePoints.push(`Within preferred height range (${candidate.height} cm)`);
    } else {
      heightScore = 2;
    }
  } else if (isMaleSeeker) {
    // Assessment requirement for male customers: "consider women who are shorter"
    if (candidate.height < seeker.height) {
      heightScore = 7;
      positivePoints.push(`Complementary height (${candidate.height} cm vs ${seeker.height} cm)`);
    } else {
      heightScore = 4;
    }
  } else if (isFemaleSeeker) {
    // Standard female preference: peer or taller
    if (candidate.height >= seeker.height) {
      heightScore = 7;
      positivePoints.push(`Complementary height (${candidate.height} cm vs ${seeker.height} cm)`);
    } else {
      heightScore = 4;
    }
  } else {
    heightScore = 5;
  }

  ageHeightScore = Math.min(15, ageScore + heightScore);
  breakdowns.push({
    dimension: 'Age & Height Profile',
    maxScore: 15,
    earnedScore: ageHeightScore,
    details: `Age: ${candidateAge} yrs · Height: ${candidate.height} cm`,
    status: ageHeightScore >= 12 ? 'match' : 'partial',
  });

  // Dimension 7: Lifestyle, Diet & Pets (15 pts)
  let lifestyleScore = 0;
  let dietScore = 0;
  if (seeker.diet && candidate.diet) {
    if (seeker.diet.toLowerCase() === candidate.diet.toLowerCase()) {
      dietScore = 6;
      positivePoints.push(`Shared dietary lifestyle (${candidate.diet})`);
    } else if (pref?.preferredDiet && pref.preferredDiet.includes(candidate.diet)) {
      dietScore = 6;
    } else {
      dietScore = 2;
      mismatches.push(`Dietary difference: ${seeker.diet} vs ${candidate.diet}`);
    }
  } else {
    dietScore = 3;
    unknowns.push('Dietary preference unstated');
  }

  let petScore = 0;
  if (seeker.openToPets && candidate.openToPets) {
    if (seeker.openToPets === candidate.openToPets) {
      petScore = 5;
    } else if (seeker.openToPets === 'YES' && candidate.openToPets === 'NO') {
      petScore = 1;
      mismatches.push('Divergent views on pets');
    } else {
      petScore = 3;
    }
  } else {
    petScore = 3;
  }

  // Shared hobbies
  let hobbyScore = 0;
  const sharedHobbies = seeker.hobbies.filter((h) =>
    candidate.hobbies.some((ch) => ch.toLowerCase() === h.toLowerCase())
  );
  if (sharedHobbies.length > 0) {
    hobbyScore = 4;
    positivePoints.push(`Common leisure interests: ${sharedHobbies.slice(0, 3).join(', ')}`);
  } else {
    hobbyScore = 2;
  }

  lifestyleScore = Math.min(15, dietScore + petScore + hobbyScore);
  breakdowns.push({
    dimension: 'Lifestyle, Diet & Pets',
    maxScore: 15,
    earnedScore: lifestyleScore,
    details: `Diet: ${candidate.diet || 'Unknown'} · Pets: ${candidate.openToPets}`,
    status: lifestyleScore >= 11 ? 'match' : lifestyleScore >= 7 ? 'partial' : 'mismatch',
  });

  let totalScore = Math.min(
    100,
    valuesScore + childrenScore + locationScore + careerScore + langScore + ageHeightScore + lifestyleScore
  );

  // ---------------------------------------------------------------------------
  // Male-seeker "core profile rule" (assessment requirement):
  // For male customers the brief asks for women who are YOUNGER, SHORTER and
  // EARN LESS (plus matching views on children, handled in Dimension 2).
  // The soft bonuses above are easy to drown out when a client has explicit
  // partner preferences, so this rule is applied as a separate, always-on
  // adjustment. Each violated expectation costs points and is surfaced to the
  // matchmaker as an explicit mismatch, so nothing is hidden or silently
  // overridden. It only applies in the male -> female direction; the reverse
  // direction (female evaluating a male) uses its own logic and is untouched.
  // ---------------------------------------------------------------------------
  if (isMaleSeeker) {
    const coreAge = calculateAge(candidate.dateOfBirth);
    const seekerAgeNow = calculateAge(seeker.dateOfBirth);
    let coreMet = 0;

    if (coreAge <= seekerAgeNow) {
      coreMet++;
    } else {
      totalScore -= 8;
      mismatches.push(`Candidate is older than the client (${coreAge} vs ${seekerAgeNow} yrs)`);
    }
    if (candidate.height < seeker.height) {
      coreMet++;
    } else {
      totalScore -= 6;
      mismatches.push(`Candidate is not shorter than the client (${candidate.height} vs ${seeker.height} cm)`);
    }
    if (candidate.income <= seeker.income) {
      coreMet++;
    } else {
      totalScore -= 5;
      mismatches.push('Candidate earns more than the client');
    }
    if (coreMet === 3) {
      positivePoints.push('Matches the client\'s core profile: younger, shorter and earns less');
    }
    totalScore = Math.max(0, totalScore);
  }

  return {
    score: totalScore,
    breakdowns,
    positivePoints,
    mismatches,
    unknowns,
  };
}

/**
 * Stage C: Mutual Compatibility Calculation
 * Evaluates both directions and computes a balanced geometric mean score.
 * Formula: Geometric Mean = Math.round(Math.sqrt(C1 * C2)) with penalty for extreme asymmetry.
 */
export function calculateMutualScore(
  customerToCandidateScore: number,
  candidateToCustomerScore: number
): number {
  if (customerToCandidateScore <= 0 || candidateToCustomerScore <= 0) {
    return 0;
  }

  // Geometric mean
  let geometricMean = Math.sqrt(customerToCandidateScore * candidateToCustomerScore);

  // Asymmetry penalty: if one side is 90 and the other is 40, penalize one-sided false positives
  const discrepancy = Math.abs(customerToCandidateScore - candidateToCustomerScore);
  if (discrepancy > 25) {
    const penalty = (discrepancy - 25) * 0.2;
    geometricMean = Math.max(0, geometricMean - penalty);
  }

  return Math.min(100, Math.max(0, Math.round(geometricMean)));
}

/**
 * Stage D: Determine Compatibility Label
 */
export function getCompatibilityLabel(overallScore: number): 'High Potential' | 'Promising' | 'Needs Review' {
  if (overallScore >= 80) return 'High Potential';
  if (overallScore >= 65) return 'Promising';
  return 'Needs Review';
}

/**
 * Stage E: End-to-End Match Recommendation Generation & Ranking
 */
export function generateRecommendations(
  customer: CustomerProfile,
  candidatePool: CustomerProfile[],
  options: MatchingOptions = {}
): MatchRecommendation[] {
  const recommendations: MatchRecommendation[] = [];

  for (const candidate of candidatePool) {
    // Stage A: Eligibility
    const eligibility = isEligibleCandidate(customer, candidate, options);
    if (!eligibility.eligible) {
      continue;
    }

    // Stage B: Directional Scoring
    const fitCtoCand = evaluateDirectionalFit(customer, candidate);
    const fitCandtoC = evaluateDirectionalFit(candidate, customer);

    // Stage C: Mutual Compatibility
    const overallScore = calculateMutualScore(fitCtoCand.score, fitCandtoC.score);

    // Stage D: Explainable Results
    const label = getCompatibilityLabel(overallScore);

    // Combine distinct positive reasons and deduplicate
    const combinedPositives = Array.from(new Set([...fitCtoCand.positivePoints, ...fitCandtoC.positivePoints]));
    const combinedMismatches = Array.from(new Set([...fitCtoCand.mismatches, ...fitCandtoC.mismatches]));
    const combinedUnknowns = Array.from(new Set([...fitCtoCand.unknowns, ...fitCandtoC.unknowns]));

    const candidateAge = calculateAge(candidate.dateOfBirth);

    const conciseExplanation = `${candidate.firstName} (${candidateAge}, ${candidate.city}) is a ${label} candidate with ${overallScore}% mutual compatibility. Strong alignment observed in ${
      fitCtoCand.breakdowns
        .filter((b) => b.status === 'match')
        .map((b) => b.dimension)
        .slice(0, 2)
        .join(' and ') || 'core lifestyle preferences'
    }. Directional fit: Customer->Candidate ${fitCtoCand.score}%, Candidate->Customer ${fitCandtoC.score}%.`;

    recommendations.push({
      candidateId: candidate.id,
      candidateSummary: {
        id: candidate.id,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        age: candidateAge,
        gender: candidate.gender,
        city: candidate.city,
        country: candidate.country,
        designation: candidate.designation,
        currentCompany: candidate.currentCompany,
        degree: candidate.degree,
        height: candidate.height,
        verificationStatus: candidate.verificationStatus,
        journeyStage: candidate.journeyStage,
      },
      overallScore,
      customerToCandidateScore: fitCtoCand.score,
      candidateToCustomerScore: fitCandtoC.score,
      compatibilityLabel: label,
      positiveReasons: combinedPositives,
      potentialMismatches: combinedMismatches,
      unknownDetails: combinedUnknowns,
      verificationStatus: candidate.verificationStatus,
      conciseExplanation,
      directionalBreakdowns: {
        customerToCandidate: fitCtoCand.breakdowns,
        candidateToCustomer: fitCandtoC.breakdowns,
      },
    });
  }

  // Stage E: Deterministic Ranking & Tie Breaking
  recommendations.sort((a, b) => {
    // 1. Overall Score descending
    if (b.overallScore !== a.overallScore) {
      return b.overallScore - a.overallScore;
    }
    // 2. Minimum of directional scores descending (favors balanced mutual compatibility)
    const minA = Math.min(a.customerToCandidateScore, a.candidateToCustomerScore);
    const minB = Math.min(b.customerToCandidateScore, b.candidateToCustomerScore);
    if (minB !== minA) {
      return minB - minA;
    }
    // 3. Verification status (VERIFIED first)
    if (a.verificationStatus === 'VERIFIED' && b.verificationStatus !== 'VERIFIED') return -1;
    if (b.verificationStatus === 'VERIFIED' && a.verificationStatus !== 'VERIFIED') return 1;

    // 4. Deterministic fallback by candidate ID
    return a.candidateId.localeCompare(b.candidateId);
  });

  const limit = options.limit || 20;
  return recommendations.slice(0, limit);
}
