import { useState, useRef } from 'react';
import { useResumeStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Upload, 
  FileText, 
  Star, 
  StarOff, 
  Trash2, 
  Copy,
  TrendingUp,
  MoreHorizontal,
  Eye
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

export function ResumeManager() {
  const { resumes, addResume, deleteResume, setDefaultResume, getDefaultResume } = useResumeStore();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedResume, setSelectedResume] = useState<typeof resumes[0] | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newResume, setNewResume] = useState({
    versionName: '',
    content: '',
    skills: '',
    keywords: ''
  });
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewResume({
          ...newResume,
          content: event.target?.result as string,
          versionName: file.name.replace(/\.[^/.]+$/, '')
        });
      };
      reader.readAsText(file);
    }
  };
  
  const handleAddResume = () => {
    const resume = {
      userId: 'current-user',
      versionName: newResume.versionName,
      content: newResume.content,
      isDefault: resumes.length === 0,
      skills: newResume.skills.split(',').map(s => s.trim()).filter(Boolean),
      keywords: newResume.keywords.split(',').map(k => k.trim()).filter(Boolean),
      performanceScore: 0
    };
    
    addResume(resume);
    setShowAddDialog(false);
    setNewResume({ versionName: '', content: '', skills: '', keywords: '' });
  };
  
  const handleDuplicate = (resume: typeof resumes[0]) => {
    const duplicated = {
      userId: resume.userId,
      versionName: `${resume.versionName} (Copy)`,
      content: resume.content,
      isDefault: false,
      skills: resume.skills,
      keywords: resume.keywords,
      performanceScore: resume.performanceScore
    };
    addResume(duplicated);
  };
  
  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Resume Manager</h1>
          <p className="text-muted-foreground">Manage multiple resume versions for different applications</p>
        </div>
        <div className="flex gap-3">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')}>
            <TabsList>
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Resume
          </Button>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{resumes.length}</p>
              <p className="text-sm text-muted-foreground">Total Resumes</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Star className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{getDefaultResume()?.versionName || 'None'}</p>
              <p className="text-sm text-muted-foreground">Default Resume</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {resumes.length > 0 
                  ? Math.round(resumes.reduce((sum: number, r: { performanceScore: number }) => sum + r.performanceScore, 0) / resumes.length)
                  : 0}
              </p>
              <p className="text-sm text-muted-foreground">Avg Performance</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Resume List */}
      {resumes.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-xl font-medium mb-2">No resumes yet</h3>
          <p className="text-muted-foreground mb-4">Add your first resume to start tracking</p>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Resume
          </Button>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((resume: typeof resumes[0]) => (
            <Card 
              key={resume.id} 
              className={`card-hover cursor-pointer ${resume.isDefault ? 'border-2 border-emerald-500/50' : ''}`}
              onClick={() => setSelectedResume(resume)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium line-clamp-1">{resume.versionName}</h3>
                      <p className="text-xs text-muted-foreground">
                        Updated {format(new Date(resume.updatedAt), 'MMM d')}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <button className="p-2 hover:bg-secondary rounded-lg">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedResume(resume)}>
                        <Eye className="w-4 h-4 mr-2" /> View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDefaultResume(resume.id)}>
                        <Star className="w-4 h-4 mr-2" /> Set as Default
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(resume)}>
                        <Copy className="w-4 h-4 mr-2" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => deleteResume(resume.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {resume.isDefault && (
                  <Badge className="mb-3 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    <Star className="w-3 h-3 mr-1" /> Default
                  </Badge>
                )}
                
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Performance</span>
                      <span className={`text-sm font-medium ${getPerformanceColor(resume.performanceScore)}`}>
                        {resume.performanceScore > 0 ? resume.performanceScore : 'N/A'}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          resume.performanceScore >= 80 ? 'bg-emerald-500' :
                          resume.performanceScore >= 60 ? 'bg-blue-500' :
                          resume.performanceScore >= 40 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${resume.performanceScore || 0}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {resume.skills.slice(0, 4).map((skill: string, i: number) => (
                      <span key={i} className="text-xs px-2 py-1 bg-secondary rounded">
                        {skill}
                      </span>
                    ))}
                    {resume.skills.length > 4 && (
                      <span className="text-xs px-2 py-1 bg-secondary rounded text-muted-foreground">
                        +{resume.skills.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium">Name</th>
                  <th className="text-left p-4 font-medium">Performance</th>
                  <th className="text-left p-4 font-medium">Skills</th>
                  <th className="text-left p-4 font-medium">Updated</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {resumes.map((resume: typeof resumes[0]) => (
                  <tr 
                    key={resume.id} 
                    className="border-b border-border hover:bg-secondary/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedResume(resume)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">{resume.versionName}</p>
                          {resume.isDefault && (
                            <Badge className="mt-1 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                              Default
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`font-medium ${getPerformanceColor(resume.performanceScore)}`}>
                        {resume.performanceScore > 0 ? resume.performanceScore : 'N/A'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {resume.skills.slice(0, 3).map((skill: string, i: number) => (
                          <span key={i} className="text-xs px-2 py-1 bg-secondary rounded">
                            {skill}
                          </span>
                        ))}
                        {resume.skills.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{resume.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {format(new Date(resume.updatedAt), 'MMM d, yyyy')}
                    </td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedResume(resume)}>
                            <Eye className="w-4 h-4 mr-2" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDefaultResume(resume.id)}>
                            <Star className="w-4 h-4 mr-2" /> Set as Default
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(resume)}>
                            <Copy className="w-4 h-4 mr-2" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteResume(resume.id)}
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
      )}
      
      {/* Add Resume Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Resume</DialogTitle>
            <DialogDescription>Add a new resume version to your collection</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
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
                <span className="bg-card px-2 text-muted-foreground">Or enter manually</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Version Name *</Label>
              <Input
                placeholder="e.g. Software Engineer v1"
                value={newResume.versionName}
                onChange={(e) => setNewResume({ ...newResume, versionName: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Resume Content *</Label>
              <Textarea
                placeholder="Paste your resume content here..."
                value={newResume.content}
                onChange={(e) => setNewResume({ ...newResume, content: e.target.value })}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Skills (comma separated)</Label>
              <Input
                placeholder="e.g. JavaScript, React, Node.js"
                value={newResume.skills}
                onChange={(e) => setNewResume({ ...newResume, skills: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Keywords (comma separated)</Label>
              <Input
                placeholder="e.g. Agile, REST API, Microservices"
                value={newResume.keywords}
                onChange={(e) => setNewResume({ ...newResume, keywords: e.target.value })}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddResume}
              disabled={!newResume.versionName || !newResume.content}
            >
              Add Resume
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* View Resume Dialog */}
      <Dialog open={!!selectedResume} onOpenChange={() => setSelectedResume(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedResume && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle>{selectedResume.versionName}</DialogTitle>
                    <DialogDescription>
                      Created {format(new Date(selectedResume.createdAt), 'MMMM d, yyyy')}
                    </DialogDescription>
                  </div>
                  {selectedResume.isDefault ? (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      <Star className="w-3 h-3 mr-1" /> Default
                    </Badge>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setDefaultResume(selectedResume.id)}
                    >
                      <StarOff className="w-4 h-4 mr-2" />
                      Set as Default
                    </Button>
                  )}
                </div>
              </DialogHeader>
              
              <Tabs defaultValue="content" className="mt-4">
                <TabsList>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="skills">Skills & Keywords</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>
                
                <TabsContent value="content" className="mt-4">
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <pre className="whitespace-pre-wrap font-mono text-sm">
                      {selectedResume.content}
                    </pre>
                  </div>
                </TabsContent>
                
                <TabsContent value="skills" className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedResume.skills.map((skill: string, i: number) => (
                          <Badge key={i} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedResume.keywords.map((keyword: string, i: number) => (
                          <Badge key={i} variant="outline">{keyword}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="performance" className="mt-4">
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Average ATS Score</span>
                          <span className={`text-2xl font-bold ${getPerformanceColor(selectedResume.performanceScore)}`}>
                            {selectedResume.performanceScore > 0 ? selectedResume.performanceScore : 'N/A'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    <p className="text-sm text-muted-foreground">
                      Performance score is calculated based on the average ATS scores of applications using this resume version.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-between mt-6">
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    deleteResume(selectedResume.id);
                    setSelectedResume(null);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleDuplicate(selectedResume)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </Button>
                  <Button onClick={() => setSelectedResume(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
