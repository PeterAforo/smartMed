import { useState } from "react"
import { Plus, Search, Filter, Eye, Edit, Trash2, Phone, Mail, MapPin, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { NewPatientModal } from "@/components/dashboard/modals/NewPatientModal"
import { MedicalRecordsTab } from "@/components/patient/MedicalRecordsTab"
import { PrescriptionsTab } from "@/components/patient/PrescriptionsTab"
import { VitalSignsTab } from "@/components/patient/VitalSignsTab"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"
import { useQuery } from "@tanstack/react-query"
import { format, differenceInYears } from "date-fns"

export default function Patients() {
  const { currentBranch } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showNewPatientModal, setShowNewPatientModal] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<any>(null)

  const { data: patients, isLoading, refetch } = useQuery({
    queryKey: ['patients', currentBranch?.id],
    queryFn: async () => {
      if (!currentBranch) return []
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('branch_id', currentBranch.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    },
    enabled: !!currentBranch
  })

  const filteredPatients = patients?.filter(patient => {
    const matchesSearch = searchTerm === "" || 
      `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patient_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || patient.status === statusFilter
    
    return matchesSearch && matchesStatus
  }) || []

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return "N/A"
    return differenceInYears(new Date(), new Date(dateOfBirth))
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'inactive': return 'secondary'
      case 'deceased': return 'destructive'
      default: return 'outline'
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Patient Management</h1>
            <p className="text-muted-foreground">Manage patient records and information</p>
          </div>
          <Button onClick={() => setShowNewPatientModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Patient
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patients?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {patients?.filter(p => p.status === 'active').length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">New This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {patients?.filter(p => new Date(p.created_at).getMonth() === new Date().getMonth()).length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Inactive</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {patients?.filter(p => p.status === 'inactive').length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, patient number, phone, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="deceased">Deceased</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Patients Table */}
        <Card>
          <CardHeader>
            <CardTitle>Patients ({filteredPatients.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Patient #</TableHead>
                    <TableHead>Age/Gender</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {getInitials(patient.first_name, patient.last_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{patient.first_name} {patient.last_name}</div>
                            {patient.email && (
                              <div className="text-sm text-muted-foreground">{patient.email}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{patient.patient_number}</TableCell>
                      <TableCell>
                        {getAge(patient.date_of_birth)}{patient.gender && ` • ${patient.gender}`}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {patient.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {patient.phone}
                            </div>
                          )}
                          {patient.address && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {patient.address.slice(0, 30)}...
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(patient.status)}>
                          {patient.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(patient.created_at), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPatient(patient)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* New Patient Modal */}
        <NewPatientModal 
          open={showNewPatientModal} 
          onOpenChange={setShowNewPatientModal}
        />

        {/* Patient Details Modal */}
        <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Patient Details</DialogTitle>
            </DialogHeader>
            {selectedPatient && (
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="medical">Medical</TabsTrigger>
                  <TabsTrigger value="records">Records</TabsTrigger>
                  <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                  <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                      <p className="text-sm">{selectedPatient.first_name} {selectedPatient.last_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Patient Number</label>
                      <p className="text-sm font-mono">{selectedPatient.patient_number}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                      <p className="text-sm">{selectedPatient.date_of_birth ? format(new Date(selectedPatient.date_of_birth), 'MMM dd, yyyy') : 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Gender</label>
                      <p className="text-sm">{selectedPatient.gender || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <p className="text-sm">{selectedPatient.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-sm">{selectedPatient.email || 'Not provided'}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">Address</label>
                      <p className="text-sm">{selectedPatient.address || 'Not provided'}</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="medical" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Allergies</label>
                    <p className="text-sm">{selectedPatient.allergies?.length ? selectedPatient.allergies.join(', ') : 'None reported'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Medical History</label>
                    <p className="text-sm">{JSON.stringify(selectedPatient.medical_history) !== '{}' ? 'Available' : 'No medical history on file'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Current Medications</label>
                    <p className="text-sm">{selectedPatient.current_medications?.length ? `${selectedPatient.current_medications.length} medications` : 'No current medications'}</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="records" className="space-y-4">
                  <MedicalRecordsTab patientId={selectedPatient.id} />
                </TabsContent>

                <TabsContent value="prescriptions" className="space-y-4">
                  <PrescriptionsTab patientId={selectedPatient.id} />
                </TabsContent>

                <TabsContent value="vitals" className="space-y-4">
                  <VitalSignsTab patientId={selectedPatient.id} />
                </TabsContent>
                
                <TabsContent value="history" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Registration Date</label>
                      <p className="text-sm">{format(new Date(selectedPatient.created_at), 'MMM dd, yyyy HH:mm')}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                      <p className="text-sm">{format(new Date(selectedPatient.updated_at), 'MMM dd, yyyy HH:mm')}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <Badge variant={getStatusBadgeVariant(selectedPatient.status)}>
                        {selectedPatient.status}
                      </Badge>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}