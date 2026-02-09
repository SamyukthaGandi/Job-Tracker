import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  User, 
  Resume, 
  JobApplication, 
  ApplicationStatus, 
  ATSAnalysis,
  ApplicationFilter,
  ViewMode,
  RedFlag
} from '@/types';

// Auth Store
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, name: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      
      login: async (email: string, _password: string) => {
        // Simulate authentication - in production, use Firebase Auth
        const users = JSON.parse(localStorage.getItem('jobtracker_users') || '[]');
        const user = users.find((u: User) => u.email === email);
        
        if (user) {
          set({ user, isAuthenticated: true });
          return true;
        }
        return false;
      },
      
      signup: async (email: string, name: string, _password: string) => {
        const users = JSON.parse(localStorage.getItem('jobtracker_users') || '[]');
        
        if (users.find((u: User) => u.email === email)) {
          return false;
        }
        
        const newUser: User = {
          id: crypto.randomUUID(),
          email,
          name,
          createdAt: new Date(),
          preferences: {
            defaultResume: null,
            notifications: true,
            theme: 'dark'
          }
        };
        
        users.push(newUser);
        localStorage.setItem('jobtracker_users', JSON.stringify(users));
        set({ user: newUser, isAuthenticated: true });
        return true;
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      
      updateUser: (updates) => {
        const { user } = get();
        if (user) {
          const updatedUser = { ...user, ...updates };
          set({ user: updatedUser });
        }
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);

// Resume Store
interface ResumeState {
  resumes: Resume[];
  currentResume: Resume | null;
  addResume: (resume: Omit<Resume, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateResume: (id: string, updates: Partial<Resume>) => void;
  deleteResume: (id: string) => void;
  setDefaultResume: (id: string) => void;
  getDefaultResume: () => Resume | null;
}

export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
      resumes: [],
      currentResume: null,
      
      addResume: (resumeData) => {
        const newResume: Resume = {
          ...resumeData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        set((state) => {
          const resumes = [...state.resumes, newResume];
          // If first resume, make it default
          if (resumes.length === 1) {
            newResume.isDefault = true;
          }
          return { resumes, currentResume: newResume };
        });
      },
      
      updateResume: (id, updates) => {
        set((state) => ({
          resumes: state.resumes.map(r => 
            r.id === id ? { ...r, ...updates, updatedAt: new Date() } : r
          )
        }));
      },
      
      deleteResume: (id) => {
        set((state) => ({
          resumes: state.resumes.filter(r => r.id !== id)
        }));
      },
      
      setDefaultResume: (id) => {
        set((state) => ({
          resumes: state.resumes.map(r => ({
            ...r,
            isDefault: r.id === id
          }))
        }));
      },
      
      getDefaultResume: () => {
        return get().resumes.find(r => r.isDefault) || null;
      }
    }),
    {
      name: 'resume-storage'
    }
  )
);

// Application Store
interface ApplicationState {
  applications: JobApplication[];
  viewMode: ViewMode;
  filter: ApplicationFilter;
  selectedApplication: JobApplication | null;
  
  addApplication: (app: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt' | 'lastUpdated'>) => void;
  updateApplication: (id: string, updates: Partial<JobApplication>) => void;
  deleteApplication: (id: string) => void;
  updateStatus: (id: string, status: ApplicationStatus, notes?: string) => void;
  addInterview: (appId: string, interview: Omit<import('@/types').Interview, 'id'>) => void;
  setViewMode: (mode: ViewMode) => void;
  setFilter: (filter: ApplicationFilter) => void;
  setSelectedApplication: (app: JobApplication | null) => void;
  getFilteredApplications: () => JobApplication[];
}

export const useApplicationStore = create<ApplicationState>()(
  persist(
    (set, get) => ({
      applications: [],
      viewMode: 'kanban',
      filter: {},
      selectedApplication: null,
      
      addApplication: (appData) => {
        const newApp: JobApplication = {
          ...appData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
          lastUpdated: new Date()
        };
        
        set((state) => ({
          applications: [...state.applications, newApp]
        }));
      },
      
      updateApplication: (id, updates) => {
        set((state) => ({
          applications: state.applications.map(app =>
            app.id === id 
              ? { ...app, ...updates, updatedAt: new Date(), lastUpdated: new Date() }
              : app
          )
        }));
      },
      
      deleteApplication: (id) => {
        set((state) => ({
          applications: state.applications.filter(app => app.id !== id)
        }));
      },
      
      updateStatus: (id, status, notes) => {
        set((state) => ({
          applications: state.applications.map(app => {
            if (app.id === id) {
              const statusHistory = [...app.statusHistory, {
                status,
                timestamp: new Date(),
                notes
              }];
              return { 
                ...app, 
                status, 
                statusHistory,
                updatedAt: new Date(),
                lastUpdated: new Date()
              };
            }
            return app;
          })
        }));
      },
      
      addInterview: (appId, interview) => {
        set((state) => ({
          applications: state.applications.map(app => {
            if (app.id === appId) {
              const interviews = [...app.interviews, { ...interview, id: crypto.randomUUID() }];
              return { ...app, interviews, updatedAt: new Date() };
            }
            return app;
          })
        }));
      },
      
      setViewMode: (mode) => set({ viewMode: mode }),
      
      setFilter: (filter) => set({ filter }),
      
      setSelectedApplication: (app) => set({ selectedApplication: app }),
      
      getFilteredApplications: () => {
        const { applications, filter } = get();
        
        return applications.filter(app => {
          if (filter.status?.length && !filter.status.includes(app.status)) return false;
          if (filter.company && !app.companyName.toLowerCase().includes(filter.company.toLowerCase())) return false;
          if (filter.location && !app.location?.toLowerCase().includes(filter.location.toLowerCase())) return false;
          if (filter.atsScoreRange) {
            if (app.atsScoreAtTime < filter.atsScoreRange.min || app.atsScoreAtTime > filter.atsScoreRange.max) return false;
          }
          if (filter.skills?.length) {
            const hasSkill = filter.skills.some(skill => 
              app.requiredSkills.includes(skill)
            );
            if (!hasSkill) return false;
          }
          if (filter.tags?.length) {
            const hasTag = filter.tags.some(tag => app.tags.includes(tag));
            if (!hasTag) return false;
          }
          if (filter.searchQuery) {
            const query = filter.searchQuery.toLowerCase();
            const matches = 
              app.jobRole.toLowerCase().includes(query) ||
              app.companyName.toLowerCase().includes(query);
            if (!matches) return false;
          }
          return true;
        });
      }
    }),
    {
      name: 'application-storage'
    }
  )
);

// ATS Analysis Store
interface ATSState {
  currentAnalysis: ATSAnalysis | null;
  isAnalyzing: boolean;
  analysisHistory: { resumeId: string; jobDescription: string; analysis: ATSAnalysis; timestamp: Date }[];
  
  analyzeResume: (resume: string, jobDescription: string) => Promise<ATSAnalysis>;
  clearAnalysis: () => void;
}

export const useATSStore = create<ATSState>()(
  persist(
    (set, get) => ({
      currentAnalysis: null,
      isAnalyzing: false,
      analysisHistory: [],
      
      analyzeResume: async (resume, jobDescription) => {
        set({ isAnalyzing: true });
        
        // Perform ATS analysis
        const analysis = performATSAnalysis(resume, jobDescription);
        
        set({ 
          currentAnalysis: analysis, 
          isAnalyzing: false,
          analysisHistory: [...get().analysisHistory, {
            resumeId: crypto.randomUUID(),
            jobDescription: jobDescription.substring(0, 100),
            analysis,
            timestamp: new Date()
          }]
        });
        
        return analysis;
      },
      
      clearAnalysis: () => set({ currentAnalysis: null })
    }),
    {
      name: 'ats-storage'
    }
  )
);

// ATS Analysis Function
function performATSAnalysis(resume: string, jobDescription: string): ATSAnalysis {
  const resumeLower = resume.toLowerCase();
  const jdLower = jobDescription.toLowerCase();
  
  // Extract keywords from JD
  const commonWords = new Set(['the', 'and', 'or', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);
  
  // Extract technical skills and keywords
  const skillPatterns = [
    /\b(javascript|typescript|python|java|go|rust|c\+\+|c#|ruby|php|swift|kotlin)\b/gi,
    /\b(react|angular|vue|svelte|next\.?js|nuxt|express|django|flask|spring|rails)\b/gi,
    /\b(node\.?js|deno|bun)\b/gi,
    /\b(aws|azure|gcp|google cloud|firebase|heroku|vercel|netlify)\b/gi,
    /\b(sql|mysql|postgresql|mongodb|redis|elasticsearch|dynamodb|cassandra)\b/gi,
    /\b(docker|kubernetes|jenkins|gitlab|github actions|circleci|travis)\b/gi,
    /\b(machine learning|ai|artificial intelligence|deep learning|nlp|computer vision)\b/gi,
    /\b(data science|analytics|statistics|pandas|numpy|scipy|scikit-learn|tensorflow|pytorch)\b/gi,
    /\b(agile|scrum|kanban|jira|confluence|trello)\b/gi,
    /\b(git|github|gitlab|bitbucket|svn)\b/gi,
    /\b(rest|graphql|grpc|soap|api|microservices)\b/gi,
    /\b(html|css|sass|scss|less|tailwind|bootstrap|material-ui)\b/gi,
    /\b(jest|cypress|selenium|mocha|chai|enzyme|testing library)\b/gi,
    /\b(webpack|vite|rollup|parcel|esbuild|babel)\b/gi,
    /\b(linux|unix|windows|macos|ubuntu|centos|debian)\b/gi
  ];
  
  const extractedKeywords = new Set<string>();
  skillPatterns.forEach(pattern => {
    const matches = jdLower.match(pattern);
    if (matches) {
      matches.forEach(m => extractedKeywords.add(m.toLowerCase()));
    }
  });
  
  // Also extract important nouns from JD
  const words = jdLower.match(/\b[a-z]{3,}\b/g) || [];
  const wordFreq: Record<string, number> = {};
  words.forEach(w => {
    if (!commonWords.has(w)) {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    }
  });
  
  // Add frequently mentioned words
  Object.entries(wordFreq)
    .filter(([_, count]) => count >= 2)
    .forEach(([word]) => extractedKeywords.add(word));
  
  const keywordsList = Array.from(extractedKeywords);
  
  // Check matches
  const matched: string[] = [];
  const missing: string[] = [];
  
  keywordsList.forEach(kw => {
    if (resumeLower.includes(kw)) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  });
  
  // Calculate keyword match score (0-40)
  const keywordMatchScore = keywordsList.length > 0 
    ? Math.round((matched.length / keywordsList.length) * 40)
    : 0;
  
  // Check structure (0-25)
  let structureScore = 0;
  const hasContact = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(resume) || 
                     /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(resume);
  const hasExperience = /\b(experience|work|employment|career|professional)\b/i.test(resume);
  const hasEducation = /\b(education|degree|university|college|school)\b/i.test(resume);
  const hasSkills = /\b(skills|technologies|tools|proficiencies)\b/i.test(resume);
  
  if (hasContact) structureScore += 8;
  if (hasExperience) structureScore += 7;
  if (hasEducation) structureScore += 5;
  if (hasSkills) structureScore += 5;
  
  // Check contact info (0-15)
  let contactScore = 0;
  const hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(resume);
  const hasPhone = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(resume);
  const hasLocation = /\b([A-Za-z]+,\s*[A-Z]{2}|remote|hybrid)\b/i.test(resume);
  const hasLinkedIn = /linkedin\.com/.test(resumeLower);
  
  if (hasEmail) contactScore += 6;
  if (hasPhone) contactScore += 4;
  if (hasLocation) contactScore += 3;
  if (hasLinkedIn) contactScore += 2;
  
  // Check content quality (0-20)
  let contentQualityScore = 0;
  
  // Check for metrics/numbers
  const hasMetrics = /\b\d+%|\$\d+|\d+\s*(years?|months?)|increased|decreased|improved|reduced|saved|generated|delivered\b/i.test(resume);
  if (hasMetrics) contentQualityScore += 8;
  
  // Check for action verbs
  const actionVerbs = ['achieved', 'accomplished', 'administered', 'analyzed', 'architected', 'built', 'collaborated', 'configured', 'created', 'delivered', 'designed', 'developed', 'directed', 'engineered', 'established', 'executed', 'facilitated', 'implemented', 'improved', 'increased', 'initiated', 'integrated', 'launched', 'led', 'managed', 'optimized', 'orchestrated', 'oversaw', 'planned', 'produced', 'programmed', 'reduced', 'spearheaded', 'streamlined', 'transformed'];
  const hasActionVerbs = actionVerbs.some(verb => resumeLower.includes(verb));
  if (hasActionVerbs) contentQualityScore += 7;
  
  // Check for impact statements
  const hasImpact = /\b(resulted in|led to|achieved|impact|outcome|result)\b/i.test(resume);
  if (hasImpact) contentQualityScore += 5;
  
  // Identify red flags
  const redFlags: RedFlag[] = [];
  
  if (!hasEmail) {
    redFlags.push({
      type: 'critical',
      message: 'Missing email address',
      details: 'ATS systems cannot contact you without an email'
    });
  }
  
  if (!hasMetrics) {
    redFlags.push({
      type: 'warning',
      message: 'No quantifiable achievements found',
      details: 'Your resume lacks numbers, percentages, or measurable results'
    });
  }
  
  if (!hasActionVerbs) {
    redFlags.push({
      type: 'warning',
      message: 'Weak action verbs detected',
      details: 'Replace generic verbs like "worked" or "did" with power verbs'
    });
  }
  
  if (missing.length > 10) {
    redFlags.push({
      type: 'critical',
      message: `Missing ${missing.length} critical skills from the job description`,
      details: 'Your resume is significantly misaligned with this position'
    });
  }
  
  // Generate improvements
  const improvements: import('@/types').ImprovementItem[] = [];
  
  if (missing.length > 0) {
    improvements.push({
      category: 'skills',
      issue: `Missing ${missing.length} skills mentioned in the job description`,
      suggestion: 'Add these skills if you have experience with them: ' + missing.slice(0, 5).join(', '),
      priority: 'high',
      examples: missing.slice(0, 5)
    });
  }
  
  if (!hasMetrics) {
    improvements.push({
      category: 'metrics',
      issue: 'No quantifiable metrics found',
      suggestion: 'Add numbers, percentages, and dollar amounts to your achievements',
      priority: 'high',
      examples: ['Increased revenue by 25%', 'Reduced costs by $50K', 'Improved performance by 40%']
    });
  }
  
  if (!hasActionVerbs) {
    improvements.push({
      category: 'verbs',
      issue: 'Weak or generic action verbs',
      suggestion: 'Replace weak verbs with powerful action verbs',
      priority: 'medium',
      examples: ['"Worked on" → "Architected"', '"Did" → "Orchestrated"', '"Made" → "Engineered"']
    });
  }
  
  // Calculate overall score
  const overallScore = keywordMatchScore + structureScore + contactScore + contentQualityScore;
  
  return {
    overallScore,
    keywordMatchScore,
    structureScore,
    contactScore,
    contentQualityScore,
    keywordMatches: {
      matched,
      missing,
      frequency: wordFreq
    },
    skillsAnalysis: {
      matched,
      missing: missing.slice(0, 10),
      criticalMissing: missing.slice(0, 5)
    },
    redFlags,
    improvements,
    suggestions: [
      'Tailor your resume specifically for this job description',
      'Add the missing keywords naturally in your experience section',
      'Quantify your achievements with specific numbers and percentages',
      'Use strong action verbs at the beginning of each bullet point',
      'Ensure your contact information is clearly visible at the top'
    ]
  };
}
