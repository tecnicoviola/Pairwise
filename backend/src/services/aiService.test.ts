import { describe, it, expect } from 'vitest';
import { generateDeterministicFallback, generateAIIntroductionDraft } from './aiService';
import { CustomerProfile, MatchRecommendation } from '../types';

const mockCustomer: CustomerProfile = {
  id: 'cust-1',
  firstName: 'Rohan',
  lastName: 'Verma',
  gender: 'MALE',
  dateOfBirth: '1995-01-01',
  country: 'India',
  city: 'Delhi',
  height: 175,
  email: 'rohan@example.com',
  phone: '+919999999999',
  undergraduateCollege: 'Delhi University',
  degree: 'B.Com Honours',
  currentCompany: 'Deloitte',
  designation: 'Senior Consultant',
  income: 2200000,
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
  hobbies: ['Music', 'Cycling'],
  journeyStage: 'READY_FOR_MATCHES',
  verificationStatus: 'VERIFIED',
  profileCompleteness: 100,
};

const mockCandidate: CustomerProfile = {
  id: 'cand-1',
  firstName: 'Ananya',
  lastName: 'Iyer',
  gender: 'FEMALE',
  dateOfBirth: '1997-05-10',
  country: 'India',
  city: 'Delhi',
  height: 163,
  email: 'ananya@example.com',
  phone: '+918888888888',
  undergraduateCollege: 'SRCC Delhi',
  degree: 'Bachelor of Economics',
  currentCompany: 'KPMG',
  designation: 'Management Consultant',
  income: 1900000,
  currency: 'INR',
  incomePeriod: 'per annum',
  maritalStatus: 'NEVER_MARRIED',
  languagesKnown: ['Hindi', 'English', 'Tamil'],
  numberOfSiblings: 1,
  motherTongue: 'Tamil',
  wantChildren: 'YES',
  openToRelocation: 'YES',
  openToPets: 'YES',
  diet: 'Vegetarian',
  horoscopePreference: 'NO',
  relationshipGoals: 'Marriage within 1-2 years',
  hobbies: ['Reading', 'Baking'],
  journeyStage: 'READY_FOR_MATCHES',
  verificationStatus: 'VERIFIED',
  profileCompleteness: 100,
};

const mockRec: MatchRecommendation = {
  candidateId: 'cand-1',
  candidateSummary: {
    id: 'cand-1',
    firstName: 'Ananya',
    lastName: 'Iyer',
    age: 29,
    gender: 'FEMALE',
    city: 'Delhi',
    country: 'India',
    designation: 'Management Consultant',
    currentCompany: 'KPMG',
    degree: 'Bachelor of Economics',
    height: 163,
    verificationStatus: 'VERIFIED',
    journeyStage: 'READY_FOR_MATCHES',
  },
  overallScore: 88,
  customerToCandidateScore: 89,
  candidateToCustomerScore: 87,
  compatibilityLabel: 'High Potential',
  positiveReasons: ['Both desire children within 1-2 years', 'Shared dietary lifestyle (Vegetarian)'],
  potentialMismatches: [],
  unknownDetails: [],
  verificationStatus: 'VERIFIED',
  conciseExplanation: 'High potential mutual compatibility of 88%.',
  directionalBreakdowns: {
    customerToCandidate: [],
    candidateToCustomer: [],
  },
};

describe('AI Service Fallback', () => {
  it('generates grounded deterministic fallback when API key is missing', async () => {
    const result = await generateAIIntroductionDraft(mockCustomer, mockCandidate, mockRec);
    expect(result.source).toBe('fallback');
    expect(result.draftMessage).toContain('Hi Rohan');
    expect(result.draftMessage).toContain('Ananya');
    expect(result.draftMessage).toContain('88%');
    expect(result.matchExplanation).toContain('88%');
  });
});
