import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserPlus, Search, Clock, CheckCircle, Loader2, MoreHorizontal, Eye, Edit, Trash2, LogIn, Users, ArrowUpDown, Camera, Upload } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface Patient {
  id: string;
  patient_number: string;
  first_name: string;
  other_names: string | null;
  last_name: string;
  date_of_birth: string | null;
  gender: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  country: string | null;
  region: string | null;
  constituency: string | null;
  district: string | null;
  id_type: string | null;
  id_number: string | null;
  photo_url: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  insurance_info: any;
  status: string;
  created_at: string;
}

const ID_TYPES = [
  { value: 'ghana_card', label: 'Ghana Card' },
  { value: 'voters_card', label: "Voter's Card" },
  { value: 'passport', label: 'Passport' },
  { value: 'drivers_license', label: "Driver's License" },
];

const initialFormData = {
  firstName: '',
  otherNames: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  phone: '',
  email: '',
  address: '',
  country: 'Ghana',
  region: '',
  constituency: '',
  district: '',
  idType: '',
  idNumber: '',
  photoUrl: '',
  emergencyContact: '',
  emergencyPhone: '',
  insurance: '',
  policyNumber: ''
};

const Registration = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Dialog states
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  
  // Form and selection states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [newlyRegisteredPatient, setNewlyRegisteredPatient] = useState<Patient | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch all patients from API
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['patients', 'all'],
    queryFn: () => api.getPatients({ limit: 100 }),
    refetchInterval: 10000
  });

  // Sort and filter patients
  const filteredPatients = patients
    .filter((p: Patient) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        p.first_name.toLowerCase().includes(searchLower) ||
        p.last_name.toLowerCase().includes(searchLower) ||
        p.patient_number.toLowerCase().includes(searchLower) ||
        (p.phone && p.phone.includes(searchTerm))
      );
    })
    .sort((a: Patient, b: Patient) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const stats = {
    totalPatients: patients.length,
    todayRegistrations: patients.filter((p: Patient) => {
      const today = new Date().toDateString();
      return new Date(p.created_at).toDateString() === today;
    }).length,
    activePatients: patients.filter((p: Patient) => p.status === 'active').length
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const patient = await api.createPatient({
        first_name: formData.firstName,
        other_names: formData.otherNames || null,
        last_name: formData.lastName,
        date_of_birth: formData.dateOfBirth || null,
        gender: formData.gender || null,
        phone: formData.phone || null,
        email: formData.email || null,
        address: formData.address || null,
        country: formData.country || 'Ghana',
        region: formData.region || null,
        constituency: formData.constituency || null,
        district: formData.district || null,
        id_type: formData.idType || null,
        id_number: formData.idNumber || null,
        photo_url: formData.photoUrl || null,
        emergency_contact_name: formData.emergencyContact || null,
        emergency_contact_phone: formData.emergencyPhone || null,
        insurance_info: formData.insurance ? { provider: formData.insurance, policy_number: formData.policyNumber } : {}
      });
      
      setNewlyRegisteredPatient(patient);
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setFormData(initialFormData);
      setShowRegistrationDialog(false);
      setShowSuccessDialog(true);
    } catch (error: any) {
      const errorMessage = typeof error === 'string' ? error : (error?.message || "Failed to register patient");
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setIsSubmitting(true);
    
    try {
      await api.updatePatient(selectedPatient.id, {
        first_name: formData.firstName,
        other_names: formData.otherNames || null,
        last_name: formData.lastName,
        date_of_birth: formData.dateOfBirth || null,
        gender: formData.gender || null,
        phone: formData.phone || null,
        email: formData.email || null,
        address: formData.address || null,
        country: formData.country || 'Ghana',
        region: formData.region || null,
        constituency: formData.constituency || null,
        district: formData.district || null,
        id_type: formData.idType || null,
        id_number: formData.idNumber || null,
        photo_url: formData.photoUrl || null,
        emergency_contact_name: formData.emergencyContact || null,
        emergency_contact_phone: formData.emergencyPhone || null,
        insurance_info: formData.insurance ? { provider: formData.insurance, policy_number: formData.policyNumber } : {}
      });
      
      toast({ title: "Patient Updated", description: "Patient information has been updated successfully." });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setShowEditDialog(false);
      setSelectedPatient(null);
      setFormData(initialFormData);
    } catch (error: any) {
      toast({ title: "Update Failed", description: error?.message || "Failed to update patient", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPatient) return;
    
    try {
      await api.deletePatient(selectedPatient.id);
      toast({ title: "Patient Deleted", description: "Patient has been removed from the system." });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setShowDeleteDialog(false);
      setSelectedPatient(null);
    } catch (error: any) {
      toast({ title: "Delete Failed", description: error?.message || "Failed to delete patient", variant: "destructive" });
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedIds.map(id => api.deletePatient(id)));
      toast({ title: "Patients Deleted", description: `${selectedIds.length} patients have been removed.` });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setShowBulkDeleteDialog(false);
      setSelectedIds([]);
    } catch (error: any) {
      toast({ title: "Bulk Delete Failed", description: error?.message || "Failed to delete patients", variant: "destructive" });
    }
  };

  const handleCheckin = async (patient: Patient) => {
    try {
      // Create an appointment for check-in
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toTimeString().split(' ')[0].substring(0, 5);
      
      const appointment = await api.createAppointment({
        patient_id: patient.id,
        appointment_date: today,
        appointment_time: now,
        appointment_type: 'consultation',
        status: 'in_progress',
        chief_complaint: 'Walk-in check-in'
      });
      
      // Add patient to queue
      await api.addToQueue({
        patient_id: patient.id,
        appointment_id: appointment.id,
        department: 'General',
        service_type: 'consultation',
        priority: 3
      });
      
      toast({ title: "Patient Checked In", description: `${patient.first_name} ${patient.last_name} has been added to the queue.` });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
    } catch (error: any) {
      const errorMsg = error?.message || "Failed to check in patient";
      if (errorMsg.includes('already in the queue')) {
        toast({ title: "Already Checked In", description: "This patient is already in the queue.", variant: "destructive" });
      } else {
        toast({ title: "Check-in Failed", description: errorMsg, variant: "destructive" });
      }
    }
  };

  const openEditDialog = (patient: Patient) => {
    setSelectedPatient(patient);
    setFormData({
      firstName: patient.first_name,
      otherNames: patient.other_names || '',
      lastName: patient.last_name,
      dateOfBirth: patient.date_of_birth || '',
      gender: patient.gender || '',
      phone: patient.phone || '',
      email: patient.email || '',
      address: patient.address || '',
      country: patient.country || 'Ghana',
      region: patient.region || '',
      constituency: patient.constituency || '',
      district: patient.district || '',
      idType: patient.id_type || '',
      idNumber: patient.id_number || '',
      photoUrl: patient.photo_url || '',
      emergencyContact: patient.emergency_contact_name || '',
      emergencyPhone: patient.emergency_contact_phone || '',
      insurance: patient.insurance_info?.provider || '',
      policyNumber: patient.insurance_info?.policy_number || ''
    });
    setShowEditDialog(true);
  };

  const openViewDialog = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowViewDialog(true);
  };

  const openDeleteDialog = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDeleteDialog(true);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredPatients.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPatients.map((p: Patient) => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Fetch Ghana regions
  const { data: regions = [] } = useQuery({
    queryKey: ['locations', 'regions'],
    queryFn: () => api.getRegions(),
  });

  // Fetch constituencies based on selected region
  const { data: constituencies = [] } = useQuery({
    queryKey: ['locations', 'constituencies', formData.region],
    queryFn: () => api.getConstituencies(undefined, formData.region),
    enabled: !!formData.region,
  });

  // Fetch districts based on selected region
  const { data: districts = [] } = useQuery({
    queryKey: ['locations', 'districts', formData.region],
    queryFn: () => api.getDistricts({ region_name: formData.region }),
    enabled: !!formData.region,
  });

  // Photo upload handler
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPhotoPreview(base64);
        setFormData({...formData, photoUrl: base64});
      };
      reader.readAsDataURL(file);
    }
  };

  const RegistrationForm = ({ onSubmit, submitLabel }: { onSubmit: (e: React.FormEvent) => void; submitLabel: string }) => (
    <form onSubmit={onSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      {/* Photo Upload */}
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={photoPreview || formData.photoUrl} />
          <AvatarFallback className="bg-primary/10 text-primary text-xl">
            {formData.firstName?.[0]}{formData.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <input type="file" ref={fileInputRef} accept="image/*" onChange={handlePhotoChange} className="hidden" />
          <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />Upload Photo
          </Button>
        </div>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input id="firstName" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required />
        </div>
        <div>
          <Label htmlFor="otherNames">Other Names</Label>
          <Input id="otherNames" value={formData.otherNames} onChange={(e) => setFormData({...formData, otherNames: e.target.value})} placeholder="Middle names" />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input id="lastName" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required />
        </div>
      </div>

      {/* DOB and Gender */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} />
        </div>
        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
            <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Contact */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
        </div>
      </div>

      {/* Location - Country and Region */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="country">Country</Label>
          <Input id="country" value={formData.country} disabled className="bg-muted" />
        </div>
        <div>
          <Label htmlFor="region">Region</Label>
          <Select value={formData.region} onValueChange={(value) => setFormData({...formData, region: value, constituency: '', district: ''})}>
            <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
            <SelectContent>
              {regions.map((r: any) => (
                <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Constituency and District */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="constituency">Constituency</Label>
          <Select value={formData.constituency} onValueChange={(value) => setFormData({...formData, constituency: value})} disabled={!formData.region}>
            <SelectTrigger><SelectValue placeholder="Select constituency" /></SelectTrigger>
            <SelectContent>
              {constituencies.map((c: any) => (
                <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="district">District</Label>
          <Select value={formData.district} onValueChange={(value) => setFormData({...formData, district: value})} disabled={!formData.region}>
            <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
            <SelectContent>
              {districts.map((d: any) => (
                <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Address */}
      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea id="address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} rows={2} />
      </div>

      {/* Identification */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="idType">ID Type</Label>
          <Select value={formData.idType} onValueChange={(value) => setFormData({...formData, idType: value})}>
            <SelectTrigger><SelectValue placeholder="Select ID type" /></SelectTrigger>
            <SelectContent>
              {ID_TYPES.map((id) => (
                <SelectItem key={id.value} value={id.value}>{id.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="idNumber">ID Number</Label>
          <Input id="idNumber" value={formData.idNumber} onChange={(e) => setFormData({...formData, idNumber: e.target.value})} placeholder="Enter ID number" />
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
          <Input id="emergencyContact" value={formData.emergencyContact} onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})} />
        </div>
        <div>
          <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
          <Input id="emergencyPhone" value={formData.emergencyPhone} onChange={(e) => setFormData({...formData, emergencyPhone: e.target.value})} />
        </div>
      </div>

      {/* Insurance */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="insurance">Insurance Provider</Label>
          <Select value={formData.insurance} onValueChange={(value) => setFormData({...formData, insurance: value})}>
            <SelectTrigger><SelectValue placeholder="Select insurance" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="nhis">NHIS</SelectItem>
              <SelectItem value="private">Private Insurance</SelectItem>
              <SelectItem value="cash">Cash Payment</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="policyNumber">Policy Number</Label>
          <Input id="policyNumber" value={formData.policyNumber} onChange={(e) => setFormData({...formData, policyNumber: e.target.value})} />
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</> : submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              Patient Registration
            </h1>
            <p className="text-muted-foreground">Manage patient registrations and check-ins</p>
          </div>
          <Button onClick={() => { setFormData(initialFormData); setShowRegistrationDialog(true); }}>
            <UserPlus className="mr-2 h-4 w-4" />
            New Registration
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Patients</p>
                  <p className="text-2xl font-bold text-primary">{stats.totalPatients}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Registrations</p>
                  <p className="text-2xl font-bold text-green-600">{stats.todayRegistrations}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Patients</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.activePatients}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Bulk Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <>
                <Badge variant="secondary">{selectedIds.length} selected</Badge>
                <Button variant="destructive" size="sm" onClick={() => setShowBulkDeleteDialog(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}>
              <ArrowUpDown className="mr-2 h-4 w-4" />
              {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
            </Button>
          </div>
        </div>

        {/* Patient Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.length === filteredPatients.length && filteredPatients.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No patients found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPatients.map((patient: Patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(patient.id)}
                          onCheckedChange={() => toggleSelect(patient.id)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">{patient.patient_number}</TableCell>
                      <TableCell className="font-medium">{patient.first_name} {patient.last_name}</TableCell>
                      <TableCell>{patient.phone || 'N/A'}</TableCell>
                      <TableCell className="capitalize">{patient.gender || 'N/A'}</TableCell>
                      <TableCell>{new Date(patient.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
                          {patient.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleCheckin(patient)}>
                            <LogIn className="h-4 w-4 mr-1" />
                            Check-in
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openViewDialog(patient)}>
                                <Eye className="mr-2 h-4 w-4" />View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(patient)}>
                                <Edit className="mr-2 h-4 w-4" />Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDeleteDialog(patient)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* New Registration Dialog */}
        <Dialog open={showRegistrationDialog} onOpenChange={setShowRegistrationDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>New Patient Registration</DialogTitle>
              <DialogDescription>Enter patient information to create a new record</DialogDescription>
            </DialogHeader>
            <RegistrationForm onSubmit={handleSubmit} submitLabel="Register Patient" />
          </DialogContent>
        </Dialog>

        {/* Success Dialog with Check-in Option */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                Registration Successful
              </DialogTitle>
              <DialogDescription>
                Patient has been registered successfully.
              </DialogDescription>
            </DialogHeader>
            {newlyRegisteredPatient && (
              <div className="py-4 space-y-2">
                <p><strong>Patient ID:</strong> {newlyRegisteredPatient.patient_number}</p>
                <p><strong>Name:</strong> {newlyRegisteredPatient.first_name} {newlyRegisteredPatient.last_name}</p>
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowSuccessDialog(false)}>
                Close
              </Button>
              <Button onClick={() => {
                if (newlyRegisteredPatient) handleCheckin(newlyRegisteredPatient);
                setShowSuccessDialog(false);
              }}>
                <LogIn className="mr-2 h-4 w-4" />
                Check-in Patient
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Patient Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Patient Details</DialogTitle>
              <DialogDescription>View patient information and records</DialogDescription>
            </DialogHeader>
            {selectedPatient && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-muted-foreground">Patient ID</Label><p className="font-mono">{selectedPatient.patient_number}</p></div>
                  <div><Label className="text-muted-foreground">Status</Label><div><Badge>{selectedPatient.status}</Badge></div></div>
                  <div><Label className="text-muted-foreground">Name</Label><p>{selectedPatient.first_name} {selectedPatient.last_name}</p></div>
                  <div><Label className="text-muted-foreground">Gender</Label><p className="capitalize">{selectedPatient.gender || 'N/A'}</p></div>
                  <div><Label className="text-muted-foreground">Date of Birth</Label><p>{selectedPatient.date_of_birth || 'N/A'}</p></div>
                  <div><Label className="text-muted-foreground">Phone</Label><p>{selectedPatient.phone || 'N/A'}</p></div>
                  <div><Label className="text-muted-foreground">Email</Label><p>{selectedPatient.email || 'N/A'}</p></div>
                  <div><Label className="text-muted-foreground">Insurance</Label><p>{selectedPatient.insurance_info?.provider || 'Cash'}</p></div>
                </div>
                <div><Label className="text-muted-foreground">Address</Label><p>{selectedPatient.address || 'N/A'}</p></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-muted-foreground">Emergency Contact</Label><p>{selectedPatient.emergency_contact_name || 'N/A'}</p></div>
                  <div><Label className="text-muted-foreground">Emergency Phone</Label><p>{selectedPatient.emergency_contact_phone || 'N/A'}</p></div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowViewDialog(false)}>Close</Button>
              <Button onClick={() => { setShowViewDialog(false); if (selectedPatient) openEditDialog(selectedPatient); }}>
                <Edit className="mr-2 h-4 w-4" />Edit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Patient Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Patient</DialogTitle>
              <DialogDescription>Update patient information</DialogDescription>
            </DialogHeader>
            <RegistrationForm onSubmit={handleUpdate} submitLabel="Update Patient" />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Patient?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedPatient?.first_name} {selectedPatient?.last_name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Bulk Delete Confirmation Dialog */}
        <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {selectedIds.length} Patients?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedIds.length} selected patients? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground">
                Delete All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default Registration;