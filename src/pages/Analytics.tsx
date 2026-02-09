import { useMemo } from 'react';
import { useApplicationStore, useResumeStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Briefcase, 
  Target, 
  Calendar, 
  Building2,
  Award,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import type { ApplicationStatus } from '@/types';

const statusColors: Record<ApplicationStatus, string> = {
  Applied: '#EAB308',
  Interview: '#10B981',
  Offer: '#22C55E',
  Rejected: '#EF4444',
  Ghosted: '#64748B',
  Withdrawn: '#6B7280'
};

export function Analytics() {
  const { applications } = useApplicationStore();
  const { resumes } = useResumeStore();
  
  // Calculate stats
  const stats = useMemo(() => {
    const total = applications.length;
    const interviews = applications.filter((a: { status: string }) => a.status === 'Interview' || a.status === 'Offer').length;
    const offers = applications.filter((a: { status: string }) => a.status === 'Offer').length;
    const rejected = applications.filter((a: { status: string }) => a.status === 'Rejected').length;
    const responseRate = total > 0 ? ((interviews + offers) / total) * 100 : 0;
    const successRate = total > 0 ? (offers / total) * 100 : 0;
    const avgATSScore = total > 0 
      ? applications.reduce((sum: number, a: { atsScoreAtTime: number }) => sum + a.atsScoreAtTime, 0) / total 
      : 0;
    
    return {
      total,
      interviews,
      offers,
      rejected,
      responseRate,
      successRate,
      avgATSScore
    };
  }, [applications]);
  
  // Status breakdown for pie chart
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    applications.forEach((app: { status: string }) => {
      counts[app.status] = (counts[app.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({
      name: status,
      value: count,
      color: statusColors[status as ApplicationStatus]
    }));
  }, [applications]);
  
  // Applications over time
  const timelineData = useMemo(() => {
    const months: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      const count = applications.filter(app => 
        isWithinInterval(new Date(app.appliedDate), { start: monthStart, end: monthEnd })
      ).length;
      
      months.push({
        month: format(monthDate, 'MMM'),
        count
      });
    }
    return months;
  }, [applications]);
  
  // Top companies
  const topCompanies = useMemo(() => {
    const counts: Record<string, number> = {};
    applications.forEach((app: { companyName: string }) => {
      counts[app.companyName] = (counts[app.companyName] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
      .slice(0, 5)
      .map(([company, count]) => ({ company, count }));
  }, [applications]);
  
  // Top skills
  const topSkills = useMemo(() => {
    const counts: Record<string, number> = {};
    applications.forEach((app: { requiredSkills: string[] }) => {
      app.requiredSkills.forEach((skill: string) => {
        counts[skill] = (counts[skill] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));
  }, [applications]);
  
  // Resume performance
  const resumePerformance = useMemo(() => {
    return resumes.map((resume: { versionName: string; performanceScore: number; id: string }) => ({
      name: resume.versionName,
      score: resume.performanceScore,
      applications: applications.filter((a: { resumeVersionId?: string }) => a.resumeVersionId === resume.id).length
    })).sort((a: { score: number }, b: { score: number }) => b.score - a.score);
  }, [resumes, applications]);
  
  // Weekly activity
  const weeklyStats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const thisWeek = applications.filter((a: { appliedDate: Date }) => new Date(a.appliedDate) >= weekAgo).length;
    const thisMonth = applications.filter((a: { appliedDate: Date }) => new Date(a.appliedDate) >= monthAgo).length;
    
    return { thisWeek, thisMonth };
  }, [applications]);
  
  if (applications.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track your job search performance</p>
        </div>
        
        <Card className="p-12 text-center">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-xl font-medium mb-2">No data yet</h3>
          <p className="text-muted-foreground">Start adding applications to see your analytics</p>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your job search performance and insights</p>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
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
            <div className="flex items-center gap-2 mt-4 text-sm">
              <span className="text-emerald-400 flex items-center">
                <ArrowUpRight className="w-4 h-4" />
                {weeklyStats.thisWeek}
              </span>
              <span className="text-muted-foreground">this week</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Response Rate</p>
                <p className="text-3xl font-bold">{stats.responseRate.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 text-sm">
              <span className="text-muted-foreground">
                {stats.interviews} interviews from {stats.total} apps
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-3xl font-bold">{stats.successRate.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 text-sm">
              <span className="text-muted-foreground">
                {stats.offers} offer{stats.offers !== 1 ? 's' : ''} received
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
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
                <TrendingUp className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 text-sm">
              <span className="text-muted-foreground">
                Across all applications
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Applications Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Application Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Companies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Top Companies Applied To
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCompanies} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    type="number" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    dataKey="company" 
                    type="category" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    width={120}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Top Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Most Required Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSkills}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="skill" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Resume Performance */}
      {resumes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Resume Version Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resumePerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="score" name="Avg ATS Score" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="applications" name="Applications" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-secondary/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-primary" />
                <span className="font-medium">Application Velocity</span>
              </div>
              <p className="text-2xl font-bold">{weeklyStats.thisMonth}</p>
              <p className="text-sm text-muted-foreground">applications this month</p>
            </div>
            
            <div className="p-4 bg-secondary/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-emerald-500" />
                <span className="font-medium">Best Performing Status</span>
              </div>
              <p className="text-2xl font-bold">
                {statusData.sort((a, b) => b.value - a.value)[0]?.name || 'N/A'}
              </p>
              <p className="text-sm text-muted-foreground">
                {statusData.sort((a, b) => b.value - a.value)[0]?.value || 0} applications
              </p>
            </div>
            
            <div className="p-4 bg-secondary/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-purple-500" />
                <span className="font-medium">Interview Conversion</span>
              </div>
              <p className="text-2xl font-bold">
                {stats.interviews > 0 ? ((stats.offers / stats.interviews) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-sm text-muted-foreground">
                {stats.offers} offers from {stats.interviews} interviews
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
