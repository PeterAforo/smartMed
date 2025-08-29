import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Star, ThumbsUp, AlertCircle, TrendingUp, Users, Search, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SubmitFeedbackDialog } from '@/components/feedback/SubmitFeedbackDialog';

const Feedback = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [submitFeedbackOpen, setSubmitFeedbackOpen] = useState(false);

  // Mock feedback data
  const [patientFeedback] = useState([
    {
      id: 1,
      patientName: 'John Smith',
      patientId: 'PAT001',
      department: 'Cardiology',
      provider: 'Dr. Sarah Johnson',
      rating: 5,
      date: '2024-01-15',
      category: 'care-quality',
      feedback: 'Excellent care and very professional staff. Dr. Johnson explained everything clearly.',
      status: 'reviewed',
      response: 'Thank you for your positive feedback!'
    },
    {
      id: 2,
      patientName: 'Maria Garcia',
      patientId: 'PAT002',
      department: 'Emergency',
      provider: 'Dr. Michael Brown',
      rating: 2,
      date: '2024-01-14',
      category: 'wait-time',
      feedback: 'Very long wait time in the emergency room. Waited over 3 hours.',
      status: 'pending',
      response: null
    },
    {
      id: 3,
      patientName: 'David Lee',
      patientId: 'PAT003',
      department: 'Orthopedics',
      provider: 'Dr. Jennifer Martinez',
      rating: 4,
      date: '2024-01-13',
      category: 'facilities',
      feedback: 'Good treatment but the waiting area could be more comfortable.',
      status: 'acknowledged',
      response: 'We appreciate your feedback and are working on facility improvements.'
    }
  ]);

  // Mock staff feedback
  const [staffFeedback] = useState([
    {
      id: 1,
      staffName: 'Nurse Kelly Wilson',
      department: 'ICU',
      rating: 4,
      date: '2024-01-15',
      category: 'work-environment',
      feedback: 'Good team collaboration but need better equipment in ICU.',
      status: 'under-review'
    },
    {
      id: 2,
      staffName: 'Dr. Tom Anderson',
      department: 'Surgery',
      rating: 5,
      date: '2024-01-12',
      category: 'management',
      feedback: 'Excellent support from administration. Very satisfied with current policies.',
      status: 'acknowledged'
    }
  ]);

  const [feedbackStats] = useState({
    totalFeedback: 245,
    averageRating: 4.3,
    pendingReviews: 18,
    positiveRating: 89,
    responseRate: 94,
    improvementActions: 12
  });

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reviewed': return 'bg-green-500 text-white';
      case 'acknowledged': return 'bg-blue-500 text-white';
      case 'pending': return 'bg-yellow-500 text-white';
      case 'under-review': return 'bg-orange-500 text-white';
      case 'resolved': return 'bg-gray-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'care-quality': return 'bg-blue-100 text-blue-800';
      case 'wait-time': return 'bg-red-100 text-red-800';
      case 'facilities': return 'bg-green-100 text-green-800';
      case 'staff-behavior': return 'bg-purple-100 text-purple-800';
      case 'work-environment': return 'bg-orange-100 text-orange-800';
      case 'management': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRespondToFeedback = (feedbackId: number) => {
    toast({
      title: "Response Submitted",
      description: "Your response to the feedback has been recorded.",
    });
  };

  const handleMarkResolved = (feedbackId: number) => {
    toast({
      title: "Feedback Resolved",
      description: "Feedback has been marked as resolved.",
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const filteredPatientFeedback = patientFeedback.filter(feedback =>
    feedback.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feedback.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feedback.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Feedback & Satisfaction</h1>
          <p className="text-muted-foreground">
            Patient satisfaction monitoring, staff feedback, and service improvement tracking
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{feedbackStats.totalFeedback}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{feedbackStats.averageRating}/5</div>
              <p className="text-xs text-muted-foreground">
                Overall satisfaction
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{feedbackStats.pendingReviews}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting response
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Positive Rating</CardTitle>
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{feedbackStats.positiveRating}%</div>
              <p className="text-xs text-muted-foreground">
                4-5 star ratings
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{feedbackStats.responseRate}%</div>
              <p className="text-xs text-muted-foreground">
                Feedback responded to
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Improvement Actions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{feedbackStats.improvementActions}</div>
              <p className="text-xs text-muted-foreground">
                Active initiatives
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="patient-feedback" className="space-y-4">
          <TabsList>
            <TabsTrigger value="patient-feedback">Patient Feedback</TabsTrigger>
            <TabsTrigger value="staff-feedback">Staff Feedback</TabsTrigger>
            <TabsTrigger value="surveys">Surveys</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="patient-feedback" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Patient Feedback Management</CardTitle>
                <CardDescription>
                  Review and respond to patient satisfaction feedback
                </CardDescription>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by patient, department, or provider..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                  <Button onClick={() => setSubmitFeedbackOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Submit Feedback
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPatientFeedback.map((feedback) => (
                    <div key={feedback.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{feedback.patientName}</h3>
                          <Badge variant="outline">{feedback.patientId}</Badge>
                          <Badge className={getStatusColor(feedback.status)}>
                            {feedback.status.replace('-', ' ').toUpperCase()}
                          </Badge>
                          <Badge className={getCategoryColor(feedback.category)}>
                            {feedback.category.replace('-', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                          {renderStars(feedback.rating)}
                          <span className={`ml-2 font-medium ${getRatingColor(feedback.rating)}`}>
                            {feedback.rating}/5
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Department: {feedback.department}</span>
                        <span>Provider: {feedback.provider}</span>
                        <span>Date: {feedback.date}</span>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm">{feedback.feedback}</p>
                      </div>
                      
                      {feedback.response && (
                        <div className="bg-blue-50 p-3 rounded">
                          <p className="text-sm font-medium text-blue-800">Response:</p>
                          <p className="text-sm text-blue-700">{feedback.response}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        {!feedback.response && (
                          <div className="flex items-center space-x-2 flex-1">
                            <Textarea 
                              placeholder="Type your response..." 
                              className="flex-1"
                              rows={2}
                            />
                            <Button size="sm" onClick={() => handleRespondToFeedback(feedback.id)}>
                              Send Response
                            </Button>
                          </div>
                        )}
                        {feedback.response && (
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleMarkResolved(feedback.id)}>
                              Mark Resolved
                            </Button>
                            <Button variant="outline" size="sm">
                              Follow Up
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff-feedback" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Staff Feedback & Suggestions</CardTitle>
                <CardDescription>
                  Internal feedback from healthcare staff and employees
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {staffFeedback.map((feedback) => (
                    <div key={feedback.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{feedback.staffName}</h3>
                          <Badge className={getStatusColor(feedback.status)}>
                            {feedback.status.replace('-', ' ').toUpperCase()}
                          </Badge>
                          <Badge className={getCategoryColor(feedback.category)}>
                            {feedback.category.replace('-', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                          {renderStars(feedback.rating)}
                          <span className={`ml-2 font-medium ${getRatingColor(feedback.rating)}`}>
                            {feedback.rating}/5
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Department: {feedback.department}</span>
                        <span>Date: {feedback.date}</span>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm">{feedback.feedback}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          Acknowledge
                        </Button>
                        <Button variant="outline" size="sm">
                          Create Action Item
                        </Button>
                        <Button variant="outline" size="sm">
                          Forward to HR
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="surveys" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Satisfaction Surveys</CardTitle>
                <CardDescription>
                  Create and manage patient and staff satisfaction surveys
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Active Surveys</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {[
                        { name: 'Post-Visit Satisfaction', responses: 156, completion: 78 },
                        { name: 'Emergency Department Experience', responses: 89, completion: 65 },
                        { name: 'Staff Work Environment', responses: 42, completion: 85 },
                        { name: 'Telehealth Experience', responses: 73, completion: 92 }
                      ].map((survey, index) => (
                        <div key={index} className="p-3 border rounded">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">{survey.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {survey.responses} responses • {survey.completion}% completion
                              </p>
                            </div>
                            <Button variant="outline" size="sm">View</Button>
                          </div>
                        </div>
                      ))}
                      <Button className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Survey
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Survey Templates</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {[
                        'Patient Satisfaction',
                        'Discharge Experience',
                        'Staff Engagement',
                        'Service Quality',
                        'Facility Rating',
                        'Provider Satisfaction'
                      ].map((template, index) => (
                        <div key={index} className="p-3 border rounded">
                          <div className="flex justify-between items-center">
                            <p className="font-medium text-sm">{template}</p>
                            <Button variant="outline" size="sm">Use Template</Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Feedback Analytics & Reports</CardTitle>
                <CardDescription>
                  Analyze feedback trends and generate satisfaction reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Button variant="outline" className="h-20 flex-col">
                    <TrendingUp className="h-6 w-6 mb-2" />
                    Satisfaction Trends
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <MessageSquare className="h-6 w-6 mb-2" />
                    Feedback Summary
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Star className="h-6 w-6 mb-2" />
                    Rating Analysis
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Users className="h-6 w-6 mb-2" />
                    Department Comparison
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <AlertCircle className="h-6 w-6 mb-2" />
                    Issue Tracking
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <ThumbsUp className="h-6 w-6 mb-2" />
                    Improvement Actions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <SubmitFeedbackDialog 
        open={submitFeedbackOpen}
        onOpenChange={setSubmitFeedbackOpen}
      />
    </DashboardLayout>
  );
};

export default Feedback;