import { describe, it, expect } from 'vitest';
import {
  isEligibleCandidate,
  evaluateDirectionalFit,
  calculateMutualScore,
  generateRecommendations,
  calculateAge,
} from './matchingEngine';
import { CustomerProfile } from '../types';

const baseCustomerMale: CustomerProfile = {
  id: 'cust-male-1',
  firstName: 'Arjun',
  lastName: 'Kapoor',
  gender: 'MALE',
  dateOfBirth: '1994-06-15', // ~32 yrs old
  country: 'India',
  city: 'Mumbai',
  height: 178,
  email: 'arjun@example.com',
  phone: '+919876543210',
  undergraduateCollege: 'IIT Bombay',
  degree: 'B.Tech in Computer Science',
  currentCompany: 'FinTech Labs',
  designation: 'Staff Software Engineer',
  income: 3800000,
  currency: 'INR',
  incomePeriod: 'per annum',
  maritalStatus: 'NEVER_MARRIED',
  languagesKnown: ['Hindi', 'English', 'Marathi'],
  numberOfSiblings: 1,
  motherTongue: 'Hindi',
  wantChildren: 'YES',
  openToRelocation: 'MAYBE',
  openToPets: 'YES',
  diet: 'Vegetarian',
  horoscopePreference: 'NO',
  relationshipGoals: 'Marriage within 1-2 years',
  hobbies: ['Trekking', 'Reading', 'Coffee brewing'],
  journeyStage: 'READY_FOR_MATCHES',
  verificationStatus: 'VERIFIED',
  profileCompleteness: 100,
  partnerPreferences: {
    preferredAgeMin: 25,
    preferredAgeMax: 32,
    preferredHeightMin: 155,
    preferredHeightMax: 175,
    preferredCities: ['Mumbai', 'Pune'],
    preferredChildren: 'YES',
    preferredRelocation: 'YES',
    dealbreakers: [],
  },
};

const baseCandidateFemale: CustomerProfile = {
  id: 'cand-fem-1',
  firstName: 'Pooja',
  lastName: 'Sharma',
  gender: 'FEMALE',
  dateOfBirth: '1996-08-20', // ~30 yrs old (younger than Arjun)
  country: 'India',
  city: 'Mumbai',
  height: 165, // shorter than Arjun
  email: 'pooja@example.com',
  phone: '+919876543211',
  undergraduateCollege: 'St. Xavier\'s Mumbai',
  degree: 'Bachelor of Design',
  currentCompany: 'Creative Pulse',
  designation: 'Senior Product Designer',
  income: 2400000, // earns less, aligned with prompt requirement
  currency: 'INR',
  incomePeriod: 'per annum',
  maritalStatus: 'NEVER_MARRIED',
  languagesKnown: ['Hindi', 'English'],
  numberOfSiblings: 1,
  motherTongue: 'Hindi',
  wantChildren: 'YES',
  openToRelocation: 'YES',
  openToPets: 'YES',
  diet: 'Vegetarian',
  horoscopePreference: 'NO',
  relationshipGoals: 'Marriage within 1-2 years',
  hobbies: ['Trekking', 'Art', 'Coffee brewing'],
  journeyStage: 'READY_FOR_MATCHES',
  verificationStatus: 'VERIFIED',
  profileCompleteness: 100,
  partnerPreferences: {
    preferredAgeMin: 28,
    preferredAgeMax: 35,
    preferredHeightMin: 172,
    preferredHeightMax: 185,
    preferredCities: ['Mumbai'],
    preferredChildren: 'YES',
  },
};

const ineligibleFemaleAge: CustomerProfile = {
  ...baseCandidateFemale,
  id: 'cand-fem-old',
  dateOfBirth: '1985-01-01', // 41 years old (exceeds preferredAgeMax 32)
};

const ineligibleClosedCandidate: CustomerProfile = {
  ...baseCandidateFemale,
  id: 'cand-fem-closed',
  journeyStage: 'CLOSED',
};

describe('Custom Matching Algorithm', () => {
  describe('Stage A: Eligibility Filters', () => {
    it('excludes candidate when candidate is the same person', () => {
      const result = isEligibleCandidate(baseCustomerMale, baseCustomerMale);
      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('themselves');
    });

    it('excludes candidate when profile is closed', () => {
      const result = isEligibleCandidate(baseCustomerMale, ineligibleClosedCandidate);
      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('closed');
    });

    it('excludes candidate who violates age preferences', () => {
      const result = isEligibleCandidate(baseCustomerMale, ineligibleFemaleAge);
      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('exceeds customer maximum');
    });

    it('excludes same-gender candidate in opposite-gender matching scenario', () => {
      const otherMale: CustomerProfile = { ...baseCustomerMale, id: 'male-2' };
      const result = isEligibleCandidate(baseCustomerMale, otherMale);
      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('Gender mismatch');
    });

    it('approves highly eligible candidate', () => {
      const result = isEligibleCandidate(baseCustomerMale, baseCandidateFemale);
      expect(result.eligible).toBe(true);
    });
  });

  describe('Stage B: Directional Compatibility Scoring', () => {
    it('scores high compatibility for strongly aligned pairs', () => {
      const fit = evaluateDirectionalFit(baseCustomerMale, baseCandidateFemale);
      expect(fit.score).toBeGreaterThanOrEqual(80);
      expect(fit.positivePoints.length).toBeGreaterThan(0);
      expect(fit.mismatches.length).toBe(0);
    });

    it('satisfies gender-specific requirements for male customer (younger, shorter, children alignment)', () => {
      const fit = evaluateDirectionalFit(baseCustomerMale, baseCandidateFemale);
      const ageHeightBreakdown = fit.breakdowns.find((b) => b.dimension === 'Age & Height Profile');
      const childrenBreakdown = fit.breakdowns.find((b) => b.dimension === 'Children & Family Expectations');

      expect(ageHeightBreakdown?.status).toBe('match');
      expect(childrenBreakdown?.status).toBe('match');
    });

    it('penalises a male customer\'s candidate who is older, taller and earns more', () => {
      const ideal = evaluateDirectionalFit(baseCustomerMale, baseCandidateFemale);
      const opposite: CustomerProfile = {
        ...baseCandidateFemale,
        dateOfBirth: '1990-01-01', // older than the client
        height: 185, // taller than the client
        income: 6000000, // earns more than the client
      };
      const worse = evaluateDirectionalFit(baseCustomerMale, opposite);
      expect(worse.score).toBeLessThan(ideal.score - 15);
      expect(worse.mismatches.some((m) => m.includes('older'))).toBe(true);
      expect(worse.mismatches.some((m) => m.includes('shorter'))).toBe(true);
      expect(worse.mismatches.some((m) => m.includes('earns more'))).toBe(true);
    });

    it('does not apply the male core rule when a female customer is the seeker', () => {
      const fit = evaluateDirectionalFit(baseCandidateFemale, baseCustomerMale);
      expect(fit.mismatches.some((m) => m.includes('older than the client'))).toBe(false);
    });

    it('handles missing/unknown attributes gracefully without breaking or inflating score', () => {
      const incompleteCandidate: CustomerProfile = {
        ...baseCandidateFemale,
        id: 'cand-incomplete',
        diet: null,
        partnerPreferences: null,
      };
      const fit = evaluateDirectionalFit(baseCustomerMale, incompleteCandidate);
      expect(fit.unknowns).toContain('Dietary preference unstated');
      expect(fit.score).toBeLessThan(95); // Not inflated
    });
  });

  describe('Stage C: Mutual Compatibility Score', () => {
    it('computes balanced mutual score using geometric mean with asymmetry check', () => {
      const score = calculateMutualScore(90, 90);
      expect(score).toBe(90);
    });

    it('prevents one-sided inflation when one side has very low score', () => {
      const score = calculateMutualScore(95, 20);
      // Geometric mean of 95 & 20 is ~43, with asymmetry penalty (diff=75) drops well below 40
      expect(score).toBeLessThan(40);
    });

    it('returns 0 when either directional score is 0', () => {
      expect(calculateMutualScore(0, 95)).toBe(0);
      expect(calculateMutualScore(85, 0)).toBe(0);
    });
  });

  describe('Stage E: Ranking and Tie Breaking', () => {
    it('ranks eligible candidates by mutual score in descending order', () => {
      const lessCompatibleCandidate: CustomerProfile = {
        ...baseCandidateFemale,
        id: 'cand-fem-low',
        city: 'Bangalore', // different city
        openToRelocation: 'NO',
        diet: 'Non-Vegetarian', // mismatch
        wantChildren: 'NO', // children mismatch
      };

      const results = generateRecommendations(baseCustomerMale, [
        lessCompatibleCandidate,
        baseCandidateFemale,
      ]);

      expect(results.length).toBe(2);
      expect(results[0].candidateId).toBe(baseCandidateFemale.id);
      expect(results[0].overallScore).toBeGreaterThan(results[1].overallScore);
      expect(results[0].compatibilityLabel).toBe('High Potential');
    });
  });
});
