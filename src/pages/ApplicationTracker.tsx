import { useState, useMemo } from 'react';
import { useApplicationStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  Calendar,
  MoreHorizontal,
  ExternalLink,
  Clock,
  Briefcase,
  Trash2,
  Edit3
} from 'lucide-react';
import { format } from 'date-fns';
import type { ApplicationStatus, JobApplication, ViewMode } from '@/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const statusColumns: ApplicationStatus[] = ['Applied', 'Interview', 'Offer', 'Rejected', 'Ghosted', 'Withdrawn'];

const statusConfig: Record<ApplicationStatus, { label: string; color: string; bgColor: string }> = {
  Applied: { label: 'Applied', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  Interview: { label: 'Interview', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
  Offer: { label: 'Offer', color: 'text-green-400', bgColor: 'bg-green-500/20' },
  Rejected: { label: 'Rejected', color: 'text-red-400', bgColor: 'bg-red-500/20' },
  Ghosted: { label: 'Ghosted', color: 'text-slate-400', bgColor: 'bg-slate-500/20' },
  Withdrawn: { label: 'Withdrawn', color: 'text-gray-400', bgColor: 'bg-gray-500/20' }
};

export function ApplicationTracker() {
  const { applications, viewMode, setViewMode, addApplication, deleteApplication, updateStatus } = useApplicationStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [draggedApp, setDraggedApp] = useState<string | null>(null);
  
  const [newApplication, setNewApplication] = useState({
    jobRole: '',
    companyName: '',
    jobUrl: '',
    jobDescription: '',
    jobType: 'Full-time' as const,
    location: '',
    isRemote: false,
    salaryMin: '',
    salaryMax: '',
    recruiterName: '',
    recruiterEmail: '',
    customNotes: '',
    tags: '',
    atsScoreAtTime: 0
  });
  
  const filteredApplications = useMemo(() => {
    return applications.filter((app: JobApplication) => {
      const matchesSearch = 
        app.jobRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.companyName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, searchQuery, statusFilter]);
  
  const applicationsByStatus = useMemo(() => {
    const grouped: Record<ApplicationStatus, JobApplication[]> = {
      Applied: [],
      Interview: [],
      Offer: [],
      Rejected: [],
      Ghosted: [],
      Withdrawn: []
    };
    filteredApplications.forEach((app: JobApplication) => {
      grouped[app.status].push(app);
    });
    return grouped;
  }, [filteredApplications]);
  
  const handleAddApplication = () => {
    const app: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt' | 'lastUpdated'> = {
      userId: 'current-user',
      jobRole: newApplication.jobRole,
      companyName: newApplication.companyName,
      jobUrl: newApplication.jobUrl,
      jobDescription: newApplication.jobDescription,
      appliedDate: new Date(),
      atsScoreAtTime: newApplication.atsScoreAtTime,
      skillsMatch: 0,
      matchedKeywords: [],
      missingKeywords: [],
      missingSkills: [],
      status: 'Applied',
      statusHistory: [{ status: 'Applied', timestamp: new Date() }],
      jobType: newApplication.jobType,
      location: newApplication.location,
      isRemote: newApplication.isRemote,
      salaryRange: newApplication.salaryMin ? {
        min: parseInt(newApplication.salaryMin),
        max: parseInt(newApplication.salaryMax) || undefined
      } : undefined,
      requiredSkills: [],
      interviews: [],
      recruiterName: newApplication.recruiterName,
      recruiterEmail: newApplication.recruiterEmail,
      customNotes: newApplication.customNotes,
      tags: newApplication.tags.split(',').map(t => t.trim()).filter(Boolean)
    };
    
    addApplication(app);
    setShowAddDialog(false);
    setNewApplication({
      jobRole: '',
      companyName: '',
      jobUrl: '',
      jobDescription: '',
      jobType: 'Full-time',
      location: '',
      isRemote: false,
      salaryMin: '',
      salaryMax: '',
      recruiterName: '',
      recruiterEmail: '',
      customNotes: '',
      tags: '',
      atsScoreAtTime: 0
    });
  };
  
  const handleDragStart = (appId: string) => {
    setDraggedApp(appId);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent, status: ApplicationStatus) => {
    e.preventDefault();
    if (draggedApp) {
      updateStatus(draggedApp, status);
      setDraggedApp(null);
    }
  };
  
  const renderKanbanView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto">
      {statusColumns.map(status => {
        const apps = applicationsByStatus[status];
        const config = statusConfig[status];
        
        return (
          <div 
            key={status}
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className={`flex items-center justify-between mb-4 pb-2 border-b border-border`}>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${config.bgColor}`} />
                <span className="font-medium">{config.label}</span>
              </div>
              <Badge variant="secondary">{apps.length}</Badge>
            </div>
            
            <div className="space-y-3">
              {apps.map(app => (
                <div
                  key={app.id}
                  draggable
                  onDragStart={() => handleDragStart(app.id)}
                  className="kanban-card"
                  onClick={() => setSelectedApp(app)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium line-clamp-1">{app.jobRole}</h4>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <button className="p-1 hover:bg-secondary rounded">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedApp(app)}>
                          <Edit3 className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteApplication(app.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{app.companyName}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {format(new Date(app.appliedDate), 'MMM d')}
                  </div>
                  {app.atsScoreAtTime > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-xs font-medium ${
                        app.atsScoreAtTime >= 80 ? 'text-emerald-400' :
                        app.atsScoreAtTime >= 60 ? 'text-blue-400' :
                        app.atsScoreAtTime >= 40 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        ATS: {app.atsScoreAtTime}
                      </span>
                    </div>
                  )}
                  {app.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {app.tags.slice(0, 2).map((tag, i) => (
                        <span key={i} className="text-xs px-1.5 py-0.5 bg-secondary rounded">
                          {tag}
                        </span>
                      ))}
                      {app.tags.length > 2 && (
                        <span className="text-xs text-muted-foreground">+{app.tags.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
  
  const renderListView = () => (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 font-medium">Role</th>
              <th className="text-left p-4 font-medium">Company</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Applied</th>
              <th className="text-left p-4 font-medium">ATS Score</th>
              <th className="text-left p-4 font-medium">Location</th>
              <th className="text-left p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map((app: JobApplication) => (
              <tr 
                key={app.id} 
                className="border-b border-border hover:bg-secondary/30 transition-colors cursor-pointer"
                onClick={() => setSelectedApp(app)}
              >
                <td className="p-4">
                  <div>
                    <p className="font-medium">{app.jobRole}</p>
                    {app.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {app.tags.slice(0, 2).map((tag: string, i: number) => (
                          <span key={i} className="text-xs px-1.5 py-0.5 bg-secondary rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4">{app.companyName}</td>
                <td className="p-4">
                  <Badge className={statusConfig[app.status as ApplicationStatus].bgColor + ' ' + statusConfig[app.status as ApplicationStatus].color}>
                    {app.status}
                  </Badge>
                </td>
                <td className="p-4 text-muted-foreground">
                  {format(new Date(app.appliedDate), 'MMM d, yyyy')}
                </td>
                <td className="p-4">
                  {app.atsScoreAtTime > 0 ? (
                    <span className={`font-medium ${
                      app.atsScoreAtTime >= 80 ? 'text-emerald-400' :
                      app.atsScoreAtTime >= 60 ? 'text-blue-400' :
                      app.atsScoreAtTime >= 40 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {app.atsScoreAtTime}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="p-4 text-muted-foreground">
                  {app.location || 'Remote'}
                </td>
                <td className="p-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedApp(app)}>
                        <Edit3 className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      {app.jobUrl && (
                        <DropdownMenuItem onClick={() => window.open(app.jobUrl, '_blank')}>
                          <ExternalLink className="w-4 h-4 mr-2" /> View Job
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => deleteApplication(app.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Application Tracker</h1>
          <p className="text-muted-foreground">Manage and track all your job applications</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Application
        </Button>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by role or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ApplicationStatus | 'all')}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statusColumns.map(status => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <TabsList>
            <TabsTrigger value="kanban">
              <LayoutGrid className="w-4 h-4 mr-2" />
              Board
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="w-4 h-4 mr-2" />
              List
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Content */}
      {applications.length === 0 ? (
        <Card className="p-12 text-center">
          <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-xl font-medium mb-2">No applications yet</h3>
          <p className="text-muted-foreground mb-4">Start tracking your job search by adding your first application</p>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Application
          </Button>
        </Card>
      ) : (
        viewMode === 'kanban' ? renderKanbanView() : renderListView()
      )}
      
      {/* Add Application Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Application</DialogTitle>
            <DialogDescription>Track a new job application</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Job Role *</Label>
                <Input
                  placeholder="e.g. Senior Software Engineer"
                  value={newApplication.jobRole}
                  onChange={(e) => setNewApplication({ ...newApplication, jobRole: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Company Name *</Label>
                <Input
                  placeholder="e.g. Google"
                  value={newApplication.companyName}
                  onChange={(e) => setNewApplication({ ...newApplication, companyName: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Job URL</Label>
              <Input
                placeholder="https://..."
                value={newApplication.jobUrl}
                onChange={(e) => setNewApplication({ ...newApplication, jobUrl: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Job Type</Label>
                <Select 
                  value={newApplication.jobType} 
                  onValueChange={(v) => setNewApplication({ ...newApplication, jobType: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Intern">Intern</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  placeholder="e.g. San Francisco, CA"
                  value={newApplication.location}
                  onChange={(e) => setNewApplication({ ...newApplication, location: e.target.value })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Salary Range (Min)</Label>
                <Input
                  type="number"
                  placeholder="80000"
                  value={newApplication.salaryMin}
                  onChange={(e) => setNewApplication({ ...newApplication, salaryMin: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Salary Range (Max)</Label>
                <Input
                  type="number"
                  placeholder="120000"
                  value={newApplication.salaryMax}
                  onChange={(e) => setNewApplication({ ...newApplication, salaryMax: e.target.value })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Recruiter Name</Label>
                <Input
                  placeholder="e.g. John Smith"
                  value={newApplication.recruiterName}
                  onChange={(e) => setNewApplication({ ...newApplication, recruiterName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Recruiter Email</Label>
                <Input
                  type="email"
                  placeholder="recruiter@company.com"
                  value={newApplication.recruiterEmail}
                  onChange={(e) => setNewApplication({ ...newApplication, recruiterEmail: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Job Description</Label>
              <Textarea
                placeholder="Paste the job description here..."
                value={newApplication.jobDescription}
                onChange={(e) => setNewApplication({ ...newApplication, jobDescription: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Tags (comma separated)</Label>
              <Input
                placeholder="e.g. Remote, High Priority, Referral"
                value={newApplication.tags}
                onChange={(e) => setNewApplication({ ...newApplication, tags: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Any additional notes..."
                value={newApplication.customNotes}
                onChange={(e) => setNewApplication({ ...newApplication, customNotes: e.target.value })}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddApplication}
              disabled={!newApplication.jobRole || !newApplication.companyName}
            >
              Add Application
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Application Detail Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedApp && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedApp.jobRole}</DialogTitle>
                <DialogDescription>{selectedApp.companyName}</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Status */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Select 
                    value={selectedApp.status} 
                    onValueChange={(v) => updateStatus(selectedApp.id, v as ApplicationStatus)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusColumns.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Applied Date</p>
                    <p className="font-medium">{format(new Date(selectedApp.appliedDate), 'MMMM d, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Job Type</p>
                    <p className="font-medium">{selectedApp.jobType || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{selectedApp.location || 'Remote'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ATS Score</p>
                    <p className={`font-medium ${
                      selectedApp.atsScoreAtTime >= 80 ? 'text-emerald-400' :
                      selectedApp.atsScoreAtTime >= 60 ? 'text-blue-400' :
                      selectedApp.atsScoreAtTime >= 40 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {selectedApp.atsScoreAtTime > 0 ? selectedApp.atsScoreAtTime : 'Not analyzed'}
                    </p>
                  </div>
                </div>
                
                {/* Tags */}
                {selectedApp.tags.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedApp.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Job Description */}
                {selectedApp.jobDescription && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Job Description</p>
                    <div className="p-4 bg-secondary/30 rounded-lg max-h-48 overflow-y-auto">
                      <p className="text-sm whitespace-pre-wrap">{selectedApp.jobDescription}</p>
                    </div>
                  </div>
                )}
                
                {/* Notes */}
                {selectedApp.customNotes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Notes</p>
                    <p className="text-sm">{selectedApp.customNotes}</p>
                  </div>
                )}
                
                {/* Interviews */}
                {selectedApp.interviews.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Interviews</p>
                    <div className="space-y-2">
                      {selectedApp.interviews.map((interview, i) => (
                        <div key={i} className="p-3 bg-secondary/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{format(new Date(interview.date), 'MMMM d, yyyy h:mm a')}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{interview.type} Interview</p>
                          {interview.interviewer && (
                            <p className="text-sm">Interviewer: {interview.interviewer}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Status History */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Status History</p>
                  <div className="space-y-2">
                    {selectedApp.statusHistory.map((entry, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <div className={`w-2 h-2 rounded-full ${statusConfig[entry.status].bgColor}`} />
                        <span>{entry.status}</span>
                        <span className="text-muted-foreground">
                          {format(new Date(entry.timestamp), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    deleteApplication(selectedApp.id);
                    setSelectedApp(null);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button onClick={() => setSelectedApp(null)}>
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
