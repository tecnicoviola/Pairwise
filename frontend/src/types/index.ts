export type Gender = 'MALE' | 'FEMALE' | 'NON_BINARY' | 'OTHER';
export type MaritalStatus = 'NEVER_MARRIED' | 'DIVORCED' | 'WIDOWED' | 'AWAITING_DIVORCE';
export type DecisionChoice = 'YES' | 'NO' | 'MAYBE';
export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
export type JourneyStage =
  | 'NEW_LEAD'
  | 'ONBOARDING'
  | 'PROFILE_INCOMPLETE'
  | 'VERIFICATION_PENDING'
  | 'PROFILE_VERIFIED'
  | 'READY_FOR_MATCHES'
  | 'MATCH_SUGGESTED'
  | 'INTRODUCTION_SENT'
  | 'FEEDBACK_PENDING'
  | 'FOLLOW_UP_REQUIRED'
  | 'CLOSED';

export type NoteCategory = 'CALL' | 'MEETING' | 'FOLLOW_UP' | 'GENERAL';
export type MatchStatus =
  | 'SUGGESTED'
  | 'APPROVED'
  | 'SENT'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'FEEDBACK_PENDING'
  | 'CLOSED';

export interface PartnerPreferences {
  id: string;
  customerId: string;
  preferredAgeMin?: number | null;
  preferredAgeMax?: number | null;
  preferredHeightMin?: number | null;
  preferredHeightMax?: number | null;
  preferredCities: string[];
  preferredEducation: string[];
  preferredProfessions: string[];
  preferredIncomeMin?: number | null;
  preferredRelocation?: DecisionChoice | null;
  preferredChildren?: DecisionChoice | null;
  preferredPets?: DecisionChoice | null;
  preferredDiet: string[];
  preferredReligions: string[];
  preferredMaritalStatus: MaritalStatus[];
  dealbreakers: string[];
  specialNotes?: string | null;
}

export interface Customer {
  id: string;
  matchmakerId?: string | null;
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: string;
  age: number;
  country: string;
  city: string;
  height: number;
  email: string;
  phone: string;
  undergraduateCollege: string;
  degree: string;
  currentCompany: string;
  designation: string;
  income: number;
  currency: string;
  incomePeriod: string;
  maritalStatus: MaritalStatus;
  languagesKnown: string[];
  numberOfSiblings: number;
  caste?: string | null;
  religion?: string | null;
  motherTongue: string;
  wantChildren: DecisionChoice;
  openToRelocation: DecisionChoice;
  openToPets: DecisionChoice;
  diet?: string | null;
  horoscopePreference: DecisionChoice;
  relationshipGoals: string;
  hobbies: string[];
  journeyStage: JourneyStage;
  verificationStatus: VerificationStatus;
  profileCompleteness: number;
  lastContactDate?: string | null;
  bioNotes?: string | null;
  createdAt: string;
  partnerPreferences?: PartnerPreferences | null;
  notes?: Note[];
  initiatedMatches?: Match[];
  activities?: ActivityEvent[];
  _count?: {
    notes: number;
    initiatedMatches: number;
  };
}

export interface Note {
  id: string;
  customerId: string;
  matchmakerId: string;
  content: string;
  category: NoteCategory;
  createdAt: string;
  matchmaker?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Match {
  id: string;
  customerId: string;
  candidateId: string;
  overallScore: number;
  customerToCandidateScore: number;
  candidateToCustomerScore: number;
  compatibilityLabel: 'High Potential' | 'Promising' | 'Needs Review';
  positiveReasons: string[];
  potentialMismatches: string[];
  unknownDetails: string[];
  status: MatchStatus;
  aiExplanation?: string | null;
  introductionDraft?: string | null;
  sentAt?: string | null;
  createdAt: string;
  candidate: Customer;
}

export interface ActivityEvent {
  id: string;
  customerId: string;
  matchmakerId?: string | null;
  eventType: string;
  description: string;
  metadata?: any;
  createdAt: string;
}

export interface MatchmakerUser {
  id: string;
  email: string;
  username: string;
  name: string;
  phone?: string | null;
}

export interface MatchRecommendation {
  candidateId: string;
  candidateSummary: {
    id: string;
    firstName: string;
    lastName: string;
    age: number;
    gender: Gender;
    city: string;
    country: string;
    designation: string;
    currentCompany: string;
    degree: string;
    height: number;
    verificationStatus: VerificationStatus;
    journeyStage: JourneyStage;
  };
  overallScore: number;
  customerToCandidateScore: number;
  candidateToCustomerScore: number;
  compatibilityLabel: 'High Potential' | 'Promising' | 'Needs Review';
  positiveReasons: string[];
  potentialMismatches: string[];
  unknownDetails: string[];
  verificationStatus: VerificationStatus;
  conciseExplanation: string;
}
