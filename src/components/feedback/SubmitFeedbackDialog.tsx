import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SubmitFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SubmitFeedbackDialog = ({ open, onOpenChange }: SubmitFeedbackDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    subject: '',
    description: '',
    priority: '',
    department: '',
    submitterName: '',
    submitterEmail: '',
    rating: '',
    improvementSuggestions: '',
    anonymous: false
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast({
      title: "Feedback Submitted",
      description: "Thank you for your feedback. We'll review it and take appropriate action."
    });

    // Reset form
    setFormData({
      category: '',
      subject: '',
      description: '',
      priority: '',
      department: '',
      submitterName: '',
      submitterEmail: '',
      rating: '',
      improvementSuggestions: '',
      anonymous: false
    });

    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Submit Feedback
          </DialogTitle>
          <DialogDescription>
            Share your suggestions, concerns, or compliments to help us improve our services
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Feedback Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="complaint">Complaint</SelectItem>
                  <SelectItem value="suggestion">Suggestion</SelectItem>
                  <SelectItem value="compliment">Compliment</SelectItem>
                  <SelectItem value="general">General Feedback</SelectItem>
                  <SelectItem value="technical">Technical Issue</SelectItem>
                  <SelectItem value="service">Service Quality</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority Level</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Related Department</Label>
            <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Services</SelectItem>
                <SelectItem value="emergency">Emergency Department</SelectItem>
                <SelectItem value="nursing">Nursing</SelectItem>
                <SelectItem value="laboratory">Laboratory</SelectItem>
                <SelectItem value="radiology">Radiology</SelectItem>
                <SelectItem value="pharmacy">Pharmacy</SelectItem>
                <SelectItem value="administration">Administration</SelectItem>
                <SelectItem value="it">IT Services</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="facilities">Facilities</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              placeholder="Brief summary of your feedback..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Please provide detailed information about your feedback..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating">Overall Rating</Label>
            <Select value={formData.rating} onValueChange={(value) => handleInputChange('rating', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Rate your experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">⭐⭐⭐⭐⭐ Excellent (5/5)</SelectItem>
                <SelectItem value="4">⭐⭐⭐⭐ Very Good (4/5)</SelectItem>
                <SelectItem value="3">⭐⭐⭐ Good (3/5)</SelectItem>
                <SelectItem value="2">⭐⭐ Fair (2/5)</SelectItem>
                <SelectItem value="1">⭐ Poor (1/5)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="improvementSuggestions">Suggestions for Improvement</Label>
            <Textarea
              id="improvementSuggestions"
              value={formData.improvementSuggestions}
              onChange={(e) => handleInputChange('improvementSuggestions', e.target.value)}
              placeholder="How can we improve our services?"
              rows={3}
            />
          </div>

          {!formData.anonymous && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="submitterName">Your Name</Label>
                <Input
                  id="submitterName"
                  value={formData.submitterName}
                  onChange={(e) => handleInputChange('submitterName', e.target.value)}
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="submitterEmail">Email Address</Label>
                <Input
                  id="submitterEmail"
                  type="email"
                  value={formData.submitterEmail}
                  onChange={(e) => handleInputChange('submitterEmail', e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={formData.anonymous}
              onChange={(e) => handleInputChange('anonymous', e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="anonymous" className="text-sm">
              Submit anonymously (we won't be able to follow up with you)
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Star className="mr-2 h-4 w-4" />
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};