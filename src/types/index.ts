// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  defaultResume: string | null;
  notifications: boolean;
  theme: 'dark' | 'light';
}

// Resume Types
export interface Resume {
  id: string;
  userId: string;
  versionName: string;
  content: string;
  fileUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  isDefault: boolean;
  skills: string[];
  keywords: string[];
  performanceScore: number;
}

// Application Status Types
export type ApplicationStatus = 
  | 'Applied' 
  | 'Interview' 
  | 'Offer' 
  | 'Rejected' 
  | 'Ghosted' 
  | 'Withdrawn';

export interface StatusHistoryEntry {
  status: ApplicationStatus;
  timestamp: Date;
  notes?: string;
}

export interface Interview {
  id: string;
  date: Date;
  type: 'Phone' | 'Video' | 'In-person' | 'Async';
  interviewer?: string;
  notes?: string;
}

export interface SalaryRange {
  min?: number;
  max?: number;
  currency?: string;
}

// Job Application Types
export interface JobApplication {
  id: string;
  userId: string;
  jobRole: string;
  companyName: string;
  jobUrl?: string;
  jobDescription: string;
  appliedDate: Date;
  
  // Resume & ATS Info
  resumeVersionId?: string;
  atsScoreAtTime: number;
  skillsMatch: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  missingSkills: string[];
  
  // Status
  status: ApplicationStatus;
  statusHistory: StatusHistoryEntry[];
  
  // Job Details
  jobType?: 'Full-time' | 'Contract' | 'Intern' | 'Part-time' | 'Freelance';
  location?: string;
  isRemote?: boolean;
  salaryRange?: SalaryRange;
  requiredSkills: string[];
  
  // Communication
  interviews: Interview[];
  recruiterEmail?: string;
  recruiterName?: string;
  
  // Notes & Tags
  customNotes?: string;
  tags: string[];
  rejectionReason?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastUpdated: Date;
}

// ATS Analysis Types
export interface ATSAnalysis {
  overallScore: number;
  keywordMatchScore: number;
  structureScore: number;
  contactScore: number;
  contentQualityScore: number;
  
  keywordMatches: {
    matched: string[];
    missing: string[];
    frequency: Record<string, number>;
  };
  
  skillsAnalysis: {
    matched: string[];
    missing: string[];
    criticalMissing: string[];
  };
  
  redFlags: RedFlag[];
  improvements: ImprovementItem[];
  suggestions: string[];
}

export interface RedFlag {
  type: 'critical' | 'warning' | 'info';
  message: string;
  details?: string;
}

export interface ImprovementItem {
  category: 'skills' | 'metrics' | 'verbs' | 'formatting' | 'structure' | 'content';
  issue: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
  examples?: string[];
}

// Analytics Types
export interface AnalyticsData {
  totalApplications: number;
  responseRate: number;
  interviewRate: number;
  offerRate: number;
  averageATSScore: number;
  applicationsByStatus: Record<ApplicationStatus, number>;
  applicationsByMonth: { month: string; count: number }[];
  topCompanies: { company: string; count: number }[];
  topSkills: { skill: string; count: number }[];
  resumePerformance: { version: string; avgScore: number; applications: number }[];
}

// View Types
export type ViewMode = 'kanban' | 'list' | 'timeline';

// Filter Types
export interface ApplicationFilter {
  status?: ApplicationStatus[];
  company?: string;
  location?: string;
  dateRange?: { start: Date; end: Date };
  atsScoreRange?: { min: number; max: number };
  skills?: string[];
  tags?: string[];
  searchQuery?: string;
}
