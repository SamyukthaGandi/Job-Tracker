import { useMemo } from 'react';
import { useApplicationStore, useResumeStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Briefcase, 
  TrendingUp, 
  Target, 
  Calendar, 
  ArrowRight,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { format } from 'date-fns';
import type { ApplicationStatus } from '@/types';

interface DashboardProps {
  onPageChange: (page: string) => void;
}

const statusConfig: Record<ApplicationStatus, { label: string; color: string; icon: typeof Briefcase }> = {
  Applied: { label: 'Applied', color: 'bg-yellow-500/20 text-yellow-400', icon: Briefcase },
  Interview: { label: 'Interview', color: 'bg-emerald-500/20 text-emerald-400', icon: Calendar },
  Offer: { label: 'Offer', color: 'bg-green-500/20 text-green-400', icon: CheckCircle2 },
  Rejected: { label: 'Rejected', color: 'bg-red-500/20 text-red-400', icon: XCircle },
  Ghosted: { label: 'Ghosted', color: 'bg-slate-500/20 text-slate-400', icon: HelpCircle },
  Withdrawn: { label: 'Withdrawn', color: 'bg-gray-500/20 text-gray-400', icon: Clock }
};

export function Dashboard({ onPageChange }: DashboardProps) {
  const { applications } = useApplicationStore();
  const { resumes } = useResumeStore();
  
  const stats = useMemo(() => {
    const total = applications.length;
    const interviews = applications.filter((a: { status: string }) => a.status === 'Interview' || a.status === 'Offer').length;
    const offers = applications.filter((a: { status: string }) => a.status === 'Offer').length;
    const rejected = applications.filter((a: { status: string }) => a.status === 'Rejected').length;
    const responseRate = total > 0 ? ((interviews + offers) / total) * 100 : 0;
    const avgATSScore = total > 0 
      ? applications.reduce((sum: number, a: { atsScoreAtTime: number }) => sum + a.atsScoreAtTime, 0) / total 
      : 0;
    
    const statusCounts = applications.reduce((acc: Record<string, number>, app: { status: string }) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<ApplicationStatus, number>);
    
    return {
      total,
      interviews,
      offers,
      rejected,
      responseRate,
      avgATSScore,
      statusCounts
    };
  }, [applications]);
  
  const recentApplications = useMemo(() => {
    return [...applications]
      .sort((a: { appliedDate: Date }, b: { appliedDate: Date }) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
      .slice(0, 5);
  }, [applications]);
  
  const upcomingInterviews = useMemo(() => {
    return applications
      .filter((a: { interviews: unknown[] }) => a.interviews.length > 0)
      .flatMap((a: { interviews: { date: Date; type: string; interviewer?: string; notes?: string }[]; companyName: string; jobRole: string }) => 
        a.interviews.map(i => ({ ...i, company: a.companyName, role: a.jobRole })))
      .filter((i: { date: Date }) => new Date(i.date) >= new Date())
      .sort((a: { date: Date }, b: { date: Date }) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }, [applications]);
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your job search journey</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onPageChange('analyzer')}>
            <FileText className="w-4 h-4 mr-2" />
            Analyze Resume
          </Button>
          <Button onClick={() => onPageChange('tracker')}>
            <Briefcase className="w-4 h-4 mr-2" />
            Add Application
          </Button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Response Rate</p>
                <p className="text-3xl font-bold">{stats.responseRate.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
            <Progress value={stats.responseRate} className="mt-4" />
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Interviews</p>
                <p className="text-3xl font-bold">{stats.interviews}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {stats.offers} offer{stats.offers !== 1 ? 's' : ''} received
            </p>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg ATS Score</p>
                <p className={`text-3xl font-bold ${
                  stats.avgATSScore >= 80 ? 'text-emerald-400' :
                  stats.avgATSScore >= 60 ? 'text-blue-400' :
                  stats.avgATSScore >= 40 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {stats.avgATSScore.toFixed(0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <Progress value={stats.avgATSScore} className="mt-4" />
          </CardContent>
        </Card>
      </div>
      
      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Application Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(statusConfig).map(([status, config]) => {
              const count = stats.statusCounts[status as ApplicationStatus] || 0;
              const Icon = config.icon;
              return (
                <div 
                  key={status}
                  className="flex flex-col items-center p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                  onClick={() => onPageChange('tracker')}
                >
                  <Icon className={`w-6 h-6 mb-2 ${config.color.split(' ')[1]}`} />
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">{config.label}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Applications</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onPageChange('tracker')}>
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentApplications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No applications yet</p>
                <Button 
                  variant="outline" 
                  className="mt-3"
                  onClick={() => onPageChange('tracker')}
                >
                  Add Your First Application
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((app: { id: string; status: ApplicationStatus; jobRole: string; companyName: string; appliedDate: Date }) => {
                  const status = statusConfig[app.status];
                  const StatusIcon = status.icon;
                  return (
                    <div 
                      key={app.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                      onClick={() => onPageChange('tracker')}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${status.color}`}>
                          <StatusIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium">{app.jobRole}</p>
                          <p className="text-sm text-muted-foreground">{app.companyName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={status.color}>
                          {app.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(app.appliedDate), 'MMM d')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Upcoming Interviews */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Interviews</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onPageChange('tracker')}>
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingInterviews.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No upcoming interviews</p>
                <p className="text-sm mt-1">Keep applying!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingInterviews.map((interview: { date: Date; company: string; role: string }, idx: number) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium">{interview.role}</p>
                        <p className="text-sm text-muted-foreground">{interview.company}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-emerald-400">
                        {format(new Date(interview.date), 'MMM d')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(interview.date), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-auto py-6 flex flex-col items-center gap-3"
              onClick={() => onPageChange('analyzer')}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-medium">Analyze Resume</p>
                <p className="text-xs text-muted-foreground">Check ATS compatibility</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-6 flex flex-col items-center gap-3"
              onClick={() => onPageChange('resumes')}
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
              <div className="text-center">
                <p className="font-medium">Manage Resumes</p>
                <p className="text-xs text-muted-foreground">{resumes.length} version{resumes.length !== 1 ? 's' : ''}</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-6 flex flex-col items-center gap-3"
              onClick={() => onPageChange('analytics')}
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-500" />
              </div>
              <div className="text-center">
                <p className="font-medium">View Analytics</p>
                <p className="text-xs text-muted-foreground">Track your progress</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-6 flex flex-col items-center gap-3"
              onClick={() => onPageChange('settings')}
            >
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-500" />
              </div>
              <div className="text-center">
                <p className="font-medium">Settings</p>
                <p className="text-xs text-muted-foreground">Customize your experience</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
