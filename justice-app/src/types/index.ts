export interface Judge {
  id: string;
  name: string;
  division: string;
  court: string;
  appointedDate: string | null;
  party: string | null;
  isActive: boolean;
  bio: string | null;
  imageUrl: string | null;
  _count?: {
    cases: number;
  };
  stats?: JudgeStats;
}

export interface JudgeStats {
  totalCases: number;
  openCases: number;
  closedCases: number;
  violentCases: number;
  repeatOffenderCases: number;
  averageBondAmount: number;
  releaseRate: number;
  guiltyPleaRate: number;
  dismissalRate: number;
  nolleRate: number;
}

export interface Defendant {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  dob: string | null;
  race: string | null;
  sex: string | null;
  city: string | null;
  state: string;
  cases?: CaseWithDetails[];
  caseCount?: number;
  violentCaseCount?: number;
}

export interface Case {
  id: string;
  caseNumber: string;
  court: string;
  county: string;
  state: string;
  filedDate: string | null;
  dispositionDate: string | null;
  status: string;
  judgeId: string | null;
  prosecutorName: string | null;
  daOffice: string | null;
  isHighProfile: boolean;
  notes: string | null;
}

export interface CaseWithDetails extends Case {
  judge?: Judge | null;
  charges?: Charge[];
  hearings?: Hearing[];
  defendants?: Defendant[];
}

export interface Charge {
  id: string;
  caseId: string;
  statute: string | null;
  description: string;
  severity: string;
  isViolent: boolean;
  isDrugRelated: boolean;
  disposition: string | null;
  sentence: string | null;
  bondAmount: number | null;
  bondType: string | null;
}

export interface Hearing {
  id: string;
  caseId: string;
  hearingDate: string;
  hearingType: string;
  outcome: string | null;
  notes: string | null;
}

export interface DataSource {
  id: string;
  name: string;
  url: string;
  description: string | null;
  isActive: boolean;
  lastChecked: string | null;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SearchParams {
  q?: string;
  court?: string;
  judge?: string;
  chargeType?: string;
  outcome?: string;
  severity?: string;
  isViolent?: string;
  year?: string;
  page?: string;
  pageSize?: string;
  sortBy?: string;
  sortDir?: string;
}

export type ChartDataPoint = {
  name: string;
  value: number;
  [key: string]: string | number;
};
