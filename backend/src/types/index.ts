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

export interface CustomerProfile {
  id: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: string | Date;
  country: string;
  city: string;
  height: number; // in cm
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
  lastContactDate?: string | Date | null;
  bioNotes?: string | null;
  partnerPreferences?: PartnerPreferencesProfile | null;
}

export interface PartnerPreferencesProfile {
  id?: string;
  customerId?: string;
  preferredAgeMin?: number | null;
  preferredAgeMax?: number | null;
  preferredHeightMin?: number | null;
  preferredHeightMax?: number | null;
  preferredCities?: string[];
  preferredEducation?: string[];
  preferredProfessions?: string[];
  preferredIncomeMin?: number | null;
  preferredRelocation?: DecisionChoice | null;
  preferredChildren?: DecisionChoice | null;
  preferredPets?: DecisionChoice | null;
  preferredDiet?: string[];
  preferredReligions?: string[];
  preferredMaritalStatus?: MaritalStatus[];
  dealbreakers?: string[];
  specialNotes?: string | null;
}

export interface DimensionBreakdown {
  dimension: string;
  maxScore: number;
  earnedScore: number;
  details: string;
  status: 'match' | 'partial' | 'mismatch' | 'unknown';
}

export interface DirectionalFitResult {
  score: number; // 0 to 100
  breakdowns: DimensionBreakdown[];
  positivePoints: string[];
  mismatches: string[];
  unknowns: string[];
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
  directionalBreakdowns: {
    customerToCandidate: DimensionBreakdown[];
    candidateToCustomer: DimensionBreakdown[];
  };
}
