import { useState, useRef } from 'react';
import { useATSStore, useResumeStore, useApplicationStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Sparkles,
  Target,
  LayoutTemplate,
  User,
  FileEdit,
  Save,
  Loader2,
  RotateCcw
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { JobApplication } from '@/types';

export function ATSAnalyzer() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [activeTab, setActiveTab] = useState('input');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [applicationData, setApplicationData] = useState({
    jobRole: '',
    companyName: '',
    jobUrl: ''
  });
  
  const { currentAnalysis, isAnalyzing, analyzeResume } = useATSStore();
  const { addResume } = useResumeStore();
  const { addApplication } = useApplicationStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setResumeText(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };
  
  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) return;
    await analyzeResume(resumeText, jobDescription);
    setActiveTab('results');
  };
  
  const handleSaveApplication = () => {
    if (!currentAnalysis) return;
    
    // Save resume version
    const newResume = {
      userId: 'current-user',
      versionName: `${applicationData.companyName} - ${applicationData.jobRole}`,
      content: resumeText,
      isDefault: false,
      skills: currentAnalysis.skillsAnalysis.matched,
      keywords: currentAnalysis.keywordMatches.matched,
      performanceScore: currentAnalysis.overallScore
    };
    
    addResume(newResume);
    
    // Save application
    const newApplication: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt' | 'lastUpdated'> = {
      userId: 'current-user',
      jobRole: applicationData.jobRole,
      companyName: applicationData.companyName,
      jobUrl: applicationData.jobUrl,
      jobDescription,
      appliedDate: new Date(),
      atsScoreAtTime: currentAnalysis.overallScore,
      skillsMatch: (currentAnalysis.skillsAnalysis.matched.length / 
        (currentAnalysis.skillsAnalysis.matched.length + currentAnalysis.skillsAnalysis.missing.length)) * 100 || 0,
      matchedKeywords: currentAnalysis.keywordMatches.matched,
      missingKeywords: currentAnalysis.keywordMatches.missing,
      missingSkills: currentAnalysis.skillsAnalysis.missing,
      status: 'Applied',
      statusHistory: [{ status: 'Applied', timestamp: new Date() }],
      requiredSkills: currentAnalysis.skillsAnalysis.matched.concat(currentAnalysis.skillsAnalysis.missing),
      interviews: [],
      tags: []
    };
    
    addApplication(newApplication);
    setShowSaveDialog(false);
    setApplicationData({ jobRole: '', companyName: '', jobUrl: '' });
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-yellow-400';
    if (score >= 20) return 'text-orange-400';
    return 'text-red-400';
  };
  
  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    if (score >= 20) return 'Poor';
    return 'Critical';
  };
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">ATS Resume Analyzer</h1>
        <p className="text-muted-foreground">Get brutally honest feedback on your resume</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="input">Input</TabsTrigger>
          <TabsTrigger value="results" disabled={!currentAnalysis}>Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="input" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resume Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Your Resume
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".txt,.pdf,.doc,.docx"
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Resume File
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or paste text</span>
                  </div>
                </div>
                <Textarea
                  placeholder="Paste your resume content here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  {resumeText.split(/\s+/).filter(w => w.length > 0).length} words
                </p>
              </CardContent>
            </Card>
            
            {/* Job Description Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Job Description
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste the job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[350px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  {jobDescription.split(/\s+/).filter(w => w.length > 0).length} words
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Analyze Button */}
          <div className="flex justify-center">
            <Button 
              size="lg"
              onClick={handleAnalyze}
              disabled={!resumeText.trim() || !jobDescription.trim() || isAnalyzing}
              className="px-8"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Analyze Resume
                </>
              )}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="results" className="space-y-6">
          {currentAnalysis && (
            <>
              {/* Overall Score */}
              <Card className="border-2 border-primary/20">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Score Circle */}
                    <div className="relative">
                      <svg className="w-40 h-40 transform -rotate-90">
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="12"
                          className="text-secondary"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="12"
                          strokeLinecap="round"
                          strokeDasharray={`${(currentAnalysis.overallScore / 100) * 440} 440`}
                          className={`${getScoreColor(currentAnalysis.overallScore)} transition-all duration-1000`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-4xl font-bold ${getScoreColor(currentAnalysis.overallScore)}`}>
                          {currentAnalysis.overallScore}
                        </span>
                        <span className="text-sm text-muted-foreground">/ 100</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                      <h2 className={`text-3xl font-bold ${getScoreColor(currentAnalysis.overallScore)}`}>
                        {getScoreLabel(currentAnalysis.overallScore)}
                      </h2>
                      <p className="text-muted-foreground mt-2">
                        Your resume scored {currentAnalysis.overallScore} out of 100
                      </p>
                      
                      {currentAnalysis.overallScore < 60 && (
                        <div className="mt-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                          <p className="text-destructive font-medium flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Your resume needs significant improvements
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Most ATS systems will likely reject this resume. Review the feedback below.
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setActiveTab('input')}>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Re-analyze
                      </Button>
                      <Button onClick={() => setShowSaveDialog(true)}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Application
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Score Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Target className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Keyword Match</p>
                        <p className="text-xl font-bold">{currentAnalysis.keywordMatchScore}/40</p>
                      </div>
                    </div>
                    <Progress value={(currentAnalysis.keywordMatchScore / 40) * 100} />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <LayoutTemplate className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Structure</p>
                        <p className="text-xl font-bold">{currentAnalysis.structureScore}/25</p>
                      </div>
                    </div>
                    <Progress value={(currentAnalysis.structureScore / 25) * 100} />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Contact Info</p>
                        <p className="text-xl font-bold">{currentAnalysis.contactScore}/15</p>
                      </div>
                    </div>
                    <Progress value={(currentAnalysis.contactScore / 15) * 100} />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <FileEdit className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Content Quality</p>
                        <p className="text-xl font-bold">{currentAnalysis.contentQualityScore}/20</p>
                      </div>
                    </div>
                    <Progress value={(currentAnalysis.contentQualityScore / 20) * 100} />
                  </CardContent>
                </Card>
              </div>
              
              {/* Red Flags */}
              {currentAnalysis.redFlags.length > 0 && (
                <Card className="border-destructive/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="w-5 h-5" />
                      Critical Issues (Red Flags)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {currentAnalysis.redFlags.map((flag: { type: string; message: string; details?: string }, idx: number) => (
                        <div 
                          key={idx}
                          className={`p-4 rounded-lg border ${
                            flag.type === 'critical' 
                              ? 'bg-destructive/10 border-destructive/30' 
                              : flag.type === 'warning'
                              ? 'bg-yellow-500/10 border-yellow-500/30'
                              : 'bg-blue-500/10 border-blue-500/30'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {flag.type === 'critical' ? (
                              <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                            ) : flag.type === 'warning' ? (
                              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            )}
                            <div>
                              <p className={`font-medium ${
                                flag.type === 'critical' ? 'text-destructive' :
                                flag.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                              }`}>
                                {flag.message}
                              </p>
                              {flag.details && (
                                <p className="text-sm text-muted-foreground mt-1">{flag.details}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Improvements Checklist */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Improvement Checklist
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentAnalysis.improvements.map((item: { category: string; issue: string; suggestion: string; priority: 'high' | 'medium' | 'low'; examples?: string[] }, idx: number) => (
                      <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          item.priority === 'high' ? 'bg-destructive/20 text-destructive' :
                          item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                          'bg-blue-500/20 text-blue-500'
                        }`}>
                          <span className="text-xs font-bold">{idx + 1}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{item.issue}</p>
                            <Badge variant={
                              item.priority === 'high' ? 'destructive' :
                              item.priority === 'medium' ? 'default' :
                              'secondary'
                            }>
                              {item.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.suggestion}</p>
                          {item.examples && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {item.examples?.map((ex: string, i: number) => (
                                <span key={i} className="text-xs px-2 py-1 bg-primary/10 rounded">
                                  {ex}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Keywords Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-5 h-5" />
                      Matched Keywords ({currentAnalysis.keywordMatches.matched.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentAnalysis.keywordMatches.matched.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No keywords matched. Your resume needs significant updates.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {currentAnalysis.keywordMatches.matched.map((kw: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <XCircle className="w-5 h-5" />
                      Missing Keywords ({currentAnalysis.keywordMatches.missing.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentAnalysis.keywordMatches.missing.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        Great job! All important keywords are present.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {currentAnalysis.keywordMatches.missing.slice(0, 20).map((kw: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                            {kw}
                          </Badge>
                        ))}
                        {currentAnalysis.keywordMatches.missing.length > 20 && (
                          <Badge variant="outline">
                            +{currentAnalysis.keywordMatches.missing.length - 20} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Save Application Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Application</DialogTitle>
            <DialogDescription>
              Save this analysis to track your application
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Job Role</Label>
              <Input
                placeholder="e.g. Senior Software Engineer"
                value={applicationData.jobRole}
                onChange={(e) => setApplicationData({ ...applicationData, jobRole: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input
                placeholder="e.g. Google"
                value={applicationData.companyName}
                onChange={(e) => setApplicationData({ ...applicationData, companyName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Job URL (optional)</Label>
              <Input
                placeholder="https://..."
                value={applicationData.jobUrl}
                onChange={(e) => setApplicationData({ ...applicationData, jobUrl: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveApplication}
              disabled={!applicationData.jobRole || !applicationData.companyName}
            >
              Save Application
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
