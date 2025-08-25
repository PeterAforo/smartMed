import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Search, Image, Calendar, FileText, Eye, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { NewImagingOrderDialog } from './NewImagingOrderDialog';

interface MedicalImagingViewerProps {
  patientId?: string;
}

export const MedicalImagingViewer: React.FC<MedicalImagingViewerProps> = ({ patientId }) => {
  const { profile, currentBranch } = useAuth();
  const [showNewOrderDialog, setShowNewOrderDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [studyTypeFilter, setStudyTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch imaging studies
  const { data: imagingStudies, isLoading: studiesLoading } = useQuery({
    queryKey: ['imaging-studies', patientId, currentBranch?.id],
    queryFn: async () => {
      let query = supabase
        .from('imaging_studies')
        .select('*')
        .eq('tenant_id', profile?.tenant_id)
        .order('study_date', { ascending: false });

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      if (currentBranch?.id) {
        query = query.eq('branch_id', currentBranch.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.tenant_id
  });

  // Fetch imaging orders
  const { data: imagingOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['imaging-orders', patientId, currentBranch?.id],
    queryFn: async () => {
      let query = supabase
        .from('imaging_orders')
        .select('*')
        .eq('tenant_id', profile?.tenant_id)
        .order('order_date', { ascending: false });

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      if (currentBranch?.id) {
        query = query.eq('branch_id', currentBranch.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.tenant_id
  });

  // Fetch imaging reports
  const { data: imagingReports } = useQuery({
    queryKey: ['imaging-reports', profile?.tenant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('imaging_reports')
        .select('*')
        .eq('tenant_id', profile?.tenant_id)
        .order('dictated_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.tenant_id
  });

  // Fetch patients data
  const { data: patients } = useQuery({
    queryKey: ['patients', profile?.tenant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, patient_number')
        .eq('tenant_id', profile?.tenant_id);

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.tenant_id
  });

  // Create patient lookup map
  const patientMap = patients?.reduce((acc, patient) => {
    acc[patient.id] = patient;
    return acc;
  }, {} as Record<string, any>) || {};

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'scheduled': return 'outline';
      case 'cancelled': return 'destructive';
      case 'no_show': return 'destructive';
      default: return 'outline';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'stat': return 'destructive';
      case 'urgent': return 'default';
      case 'routine': return 'secondary';
      default: return 'outline';
    }
  };

  const getReportStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'final': return 'default';
      case 'preliminary': return 'secondary';
      case 'addendum': return 'outline';
      case 'corrected': return 'destructive';
      default: return 'outline';
    }
  };

  const filteredStudies = imagingStudies?.filter(study => {
    const matchesSearch = searchTerm === '' || 
      study.body_part.toLowerCase().includes(searchTerm.toLowerCase()) ||
      study.indication.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patientMap[study.patient_id]?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patientMap[study.patient_id]?.last_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = studyTypeFilter === 'all' || study.study_type === studyTypeFilter;
    const matchesStatus = statusFilter === 'all' || study.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  }) || [];

  const studyTypes = [
    { value: 'x_ray', label: 'X-Ray' },
    { value: 'ct_scan', label: 'CT Scan' },
    { value: 'mri', label: 'MRI' },
    { value: 'ultrasound', label: 'Ultrasound' },
    { value: 'mammography', label: 'Mammography' },
    { value: 'nuclear_medicine', label: 'Nuclear Medicine' },
    { value: 'pet_scan', label: 'PET Scan' },
    { value: 'fluoroscopy', label: 'Fluoroscopy' }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Medical Imaging Viewer
          </CardTitle>
          <Button onClick={() => setShowNewOrderDialog(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Imaging Order
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="studies" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="studies">Imaging Studies</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="studies" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search studies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={studyTypeFilter} onValueChange={setStudyTypeFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {studyTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {studiesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  filteredStudies.map((study) => (
                    <div key={study.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">
                            {studyTypes.find(t => t.value === study.study_type)?.label} - {study.body_part}
                          </h4>
                          {patientMap[study.patient_id] && (
                            <p className="text-sm text-muted-foreground">
                              {patientMap[study.patient_id].first_name} {patientMap[study.patient_id].last_name} ({patientMap[study.patient_id].patient_number})
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusBadgeVariant(study.status)}>
                            {study.status}
                          </Badge>
                          <Badge variant={getPriorityBadgeVariant(study.priority)}>
                            {study.priority}
                          </Badge>
                          {study.contrast_used && (
                            <Badge variant="outline">Contrast</Badge>
                          )}
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground space-y-1 mb-3">
                        <p><strong>Study Date:</strong> {format(new Date(study.study_date), 'MMM dd, yyyy')}</p>
                        <p><strong>Modality:</strong> {study.modality}</p>
                        <p><strong>Indication:</strong> {study.indication}</p>
                        {study.accession_number && (
                          <p><strong>Accession #:</strong> {study.accession_number}</p>
                        )}
                        {study.radiologist && (
                          <p><strong>Radiologist:</strong> {study.radiologist}</p>
                        )}
                        {study.image_count > 0 && (
                          <p><strong>Images:</strong> {study.image_count}</p>
                        )}
                        {study.radiation_dose && (
                          <p><strong>Radiation Dose:</strong> {study.radiation_dose} mGy</p>
                        )}
                      </div>

                      {study.findings && (
                        <div className="bg-muted p-3 rounded-lg mb-3">
                          <h5 className="font-medium mb-1">Findings:</h5>
                          <p className="text-sm">{study.findings}</p>
                        </div>
                      )}

                      {study.impression && (
                        <div className="bg-primary/5 p-3 rounded-lg mb-3">
                          <h5 className="font-medium mb-1">Impression:</h5>
                          <p className="text-sm">{study.impression}</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View Images
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-1" />
                          Report
                        </Button>
                      </div>
                    </div>
                  ))
                )}
                {!studiesLoading && filteredStudies.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No imaging studies found.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  imagingOrders?.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">Order #{order.order_number}</h4>
                          {patientMap[order.patient_id] && (
                            <p className="text-sm text-muted-foreground">
                              {patientMap[order.patient_id].first_name} {patientMap[order.patient_id].last_name}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusBadgeVariant(order.status)}>
                            {order.status}
                          </Badge>
                          <Badge variant={getPriorityBadgeVariant(order.urgency)}>
                            {order.urgency}
                          </Badge>
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>Study Type:</strong> {studyTypes.find(t => t.value === order.study_type)?.label}</p>
                        <p><strong>Body Part:</strong> {order.body_part}</p>
                        <p><strong>Order Date:</strong> {format(new Date(order.order_date), 'MMM dd, yyyy')}</p>
                        {order.scheduled_date && (
                          <p><strong>Scheduled:</strong> {format(new Date(order.scheduled_date), 'MMM dd, yyyy')} 
                            {order.scheduled_time && ` at ${order.scheduled_time}`}</p>
                        )}
                        <p><strong>Indication:</strong> {order.clinical_indication}</p>
                        {order.contrast_required && (
                          <p><strong>Contrast:</strong> Required</p>
                        )}
                        {order.facility_name && (
                          <p><strong>Facility:</strong> {order.facility_name}</p>
                        )}
                        {order.prep_instructions && (
                          <p><strong>Prep Instructions:</strong> {order.prep_instructions}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {!ordersLoading && (!imagingOrders || imagingOrders.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No imaging orders found.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {imagingReports?.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">Report #{report.report_number}</h4>
                          <p className="text-sm text-muted-foreground">
                            Study ID: {report.imaging_study_id}
                          </p>
                        </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getReportStatusBadgeVariant(report.report_status)}>
                          {report.report_status}
                        </Badge>
                        {report.critical_findings && (
                          <Badge variant="destructive">Critical</Badge>
                        )}
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1 mb-3">
                      <p><strong>Study ID:</strong> {report.imaging_study_id}</p>
                      {report.dictated_date && (
                        <p><strong>Dictated:</strong> {format(new Date(report.dictated_date), 'MMM dd, yyyy')}</p>
                      )}
                      {report.radiologist && (
                        <p><strong>Radiologist:</strong> {report.radiologist}</p>
                      )}
                    </div>

                    {report.findings && (
                      <div className="bg-muted p-3 rounded-lg mb-3">
                        <h5 className="font-medium mb-1">Findings:</h5>
                        <p className="text-sm">{report.findings}</p>
                      </div>
                    )}

                    {report.impression && (
                      <div className="bg-primary/5 p-3 rounded-lg mb-3">
                        <h5 className="font-medium mb-1">Impression:</h5>
                        <p className="text-sm">{report.impression}</p>
                      </div>
                    )}

                    {report.recommendations && (
                      <div className="bg-secondary/5 p-3 rounded-lg">
                        <h5 className="font-medium mb-1">Recommendations:</h5>
                        <p className="text-sm">{report.recommendations}</p>
                      </div>
                    )}
                  </div>
                ))}
                {!imagingReports?.length && (
                  <div className="text-center py-8 text-muted-foreground">
                    No imaging reports found.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <NewImagingOrderDialog
          open={showNewOrderDialog}
          onOpenChange={setShowNewOrderDialog}
          patientId={patientId}
          onSuccess={() => setShowNewOrderDialog(false)}
        />
      </CardContent>
    </Card>
  );
};