import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Search, Banknote, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SubmitClaimDialog } from '@/components/claims/SubmitClaimDialog';

const Claims = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [submitClaimOpen, setSubmitClaimOpen] = useState(false);
  
  const [claims] = useState([
    {
      id: 1,
      claimNumber: 'CLM-2024-001',
      patientName: 'John Doe',
      patientId: 'P001',
      insuranceProvider: 'National Health Insurance',
      policyNumber: 'NHIS-2024-001',
      serviceDate: '2024-01-10',
      submissionDate: '2024-01-12',
      claimAmount: 2500.00,
      approvedAmount: 2000.00,
      status: 'approved',
      services: ['Emergency Treatment', 'X-Ray', 'Medication'],
      diagnosisCode: 'M79.3',
      doctor: 'Dr. Smith'
    },
    {
      id: 2,
      claimNumber: 'CLM-2024-002',
      patientName: 'Jane Smith',
      patientId: 'P002',
      insuranceProvider: 'Private Health Plus',
      policyNumber: 'PVT-2024-002',
      serviceDate: '2024-01-12',
      submissionDate: '2024-01-14',
      claimAmount: 5500.00,
      approvedAmount: 0.00,
      status: 'pending',
      services: ['Surgery', 'Anesthesia', 'Hospital Stay'],
      diagnosisCode: 'K80.2',
      doctor: 'Dr. Johnson'
    },
    {
      id: 3,
      claimNumber: 'CLM-2024-003',
      patientName: 'Mike Johnson',
      patientId: 'P003',
      insuranceProvider: 'Corporate Insurance Ltd',
      policyNumber: 'COR-2024-003',
      serviceDate: '2024-01-08',
      submissionDate: '2024-01-09',
      claimAmount: 1200.00,
      approvedAmount: 0.00,
      status: 'rejected',
      services: ['Consultation', 'Lab Tests'],
      diagnosisCode: 'Z00.0',
      doctor: 'Dr. Williams',
      rejectionReason: 'Service not covered under policy'
    }
  ]);

  const [reimbursements] = useState([
    {
      id: 1,
      claimNumber: 'CLM-2024-001',
      patientName: 'John Doe',
      approvedAmount: 2000.00,
      paymentDate: '2024-01-15',
      paymentMethod: 'Bank Transfer',
      status: 'paid',
      referenceNumber: 'REF-2024-001'
    },
    {
      id: 2,
      claimNumber: 'CLM-2024-004',
      patientName: 'Sarah Davis',
      approvedAmount: 1500.00,
      paymentDate: null,
      paymentMethod: 'Pending',
      status: 'processing',
      referenceNumber: null
    },
    {
      id: 3,
      claimNumber: 'CLM-2024-005',
      patientName: 'Robert Wilson',
      approvedAmount: 850.00,
      paymentDate: '2024-01-14',
      paymentMethod: 'Check',
      status: 'paid',
      referenceNumber: 'REF-2024-002'
    }
  ]);

  const [appeals] = useState([
    {
      id: 1,
      originalClaimNumber: 'CLM-2024-003',
      appealNumber: 'APL-2024-001',
      patientName: 'Mike Johnson',
      originalAmount: 1200.00,
      appealDate: '2024-01-16',
      appealReason: 'Medical necessity documentation provided',
      status: 'under-review',
      reviewer: 'Dr. Brown',
      documents: ['Medical Records', 'Doctor Notes', 'Lab Results']
    },
    {
      id: 2,
      originalClaimNumber: 'CLM-2024-006',
      appealNumber: 'APL-2024-002',
      patientName: 'Emily Brown',
      originalAmount: 3200.00,
      appealDate: '2024-01-15',
      appealReason: 'Procedure was emergency treatment',
      status: 'approved',
      reviewer: 'Dr. Davis',
      documents: ['Emergency Records', 'Treatment Timeline']
    }
  ]);

  const [stats] = useState({
    totalClaims: 245,
    pendingClaims: 32,
    approvedClaims: 178,
    rejectedClaims: 35,
    totalClaimValue: 1250000.00,
    approvedValue: 987500.00,
    averageProcessingTime: 5.2
  });

  const getClaimStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'under-review': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmitClaim = () => {
    setSubmitClaimOpen(true);
  };

  const handleApproveClaim = (claimNumber: string) => {
    toast({
      title: "Claim Approved",
      description: `Claim ${claimNumber} has been approved for payment.`
    });
  };

  const handleRejectClaim = (claimNumber: string) => {
    toast({
      title: "Claim Rejected",
      description: `Claim ${claimNumber} has been rejected.`
    });
  };

  const handleSubmitAppeal = (claimNumber: string) => {
    toast({
      title: "Appeal Submitted",
      description: `Appeal for claim ${claimNumber} has been submitted for review.`
    });
  };

  const formatCurrency = (amount: number) => {
    return `₵${amount.toLocaleString('en-GH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const filteredClaims = claims.filter(claim =>
    claim.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.insuranceProvider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Insurance Claims
          </h1>
          <p className="text-muted-foreground">Process insurance claims, manage reimbursements, and handle appeals</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Claims</p>
                  <p className="text-2xl font-bold text-primary">{stats.totalClaims}</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingClaims}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approvedClaims}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejectedClaims}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalClaimValue)}</p>
                </div>
                <Banknote className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved Value</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.approvedValue)}</p>
                </div>
                <Banknote className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Process Time</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.averageProcessingTime} days</p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="claims" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="claims">Claims Management</TabsTrigger>
            <TabsTrigger value="reimbursements">Reimbursements</TabsTrigger>
            <TabsTrigger value="appeals">Appeals</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="claims">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Insurance Claims</CardTitle>
                    <CardDescription>Manage and process insurance claims</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search claims..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64"
                      />
                    </div>
                    <Button onClick={handleSubmitClaim}>
                      <FileText className="mr-2 h-4 w-4" />
                      New Claim
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredClaims.map((claim) => (
                    <div key={claim.id} className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="font-semibold">{claim.claimNumber}</h3>
                            <p className="text-sm text-muted-foreground">Patient: {claim.patientName}</p>
                          </div>
                          <Badge className={getClaimStatusColor(claim.status)}>
                            {claim.status}
                          </Badge>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">
                              {formatCurrency(claim.claimAmount)}
                            </p>
                            {claim.approvedAmount > 0 && (
                              <p className="text-sm text-green-600">
                                Approved: {formatCurrency(claim.approvedAmount)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {claim.status === 'pending' && (
                            <>
                              <Button 
                                size="sm"
                                onClick={() => handleApproveClaim(claim.claimNumber)}
                              >
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleRejectClaim(claim.claimNumber)}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {claim.status === 'rejected' && (
                            <Button 
                              size="sm"
                              onClick={() => handleSubmitAppeal(claim.claimNumber)}
                            >
                              Submit Appeal
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Patient Information</p>
                          <p className="text-sm">ID: <span className="font-medium">{claim.patientId}</span></p>
                          <p className="text-sm">Policy: <span className="font-medium">{claim.policyNumber}</span></p>
                          <p className="text-sm">Doctor: <span className="font-medium">{claim.doctor}</span></p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Claim Details</p>
                          <p className="text-sm">Service Date: <span className="font-medium">{claim.serviceDate}</span></p>
                          <p className="text-sm">Submitted: <span className="font-medium">{claim.submissionDate}</span></p>
                          <p className="text-sm">Diagnosis: <span className="font-medium">{claim.diagnosisCode}</span></p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Services</p>
                          <div className="flex flex-wrap gap-1">
                            {claim.services.map((service, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-sm">Provider: <span className="font-medium">{claim.insuranceProvider}</span></p>
                        </div>
                      </div>
                      
                      {claim.rejectionReason && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                          <p className="text-sm text-red-800">
                            <strong>Rejection Reason:</strong> {claim.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reimbursements">
            <Card>
              <CardHeader>
                <CardTitle>Reimbursement Processing</CardTitle>
                <CardDescription>Track approved claims and payment processing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reimbursements.map((reimbursement) => (
                    <div key={reimbursement.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold">{reimbursement.claimNumber}</h3>
                          <Badge className={getClaimStatusColor(reimbursement.status)}>
                            {reimbursement.status}
                          </Badge>
                          <span className="text-lg font-bold text-green-600">
                            {formatCurrency(reimbursement.approvedAmount)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Patient: {reimbursement.patientName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Method: {reimbursement.paymentMethod}
                          {reimbursement.paymentDate && ` • Date: ${reimbursement.paymentDate}`}
                          {reimbursement.referenceNumber && ` • Ref: ${reimbursement.referenceNumber}`}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        {reimbursement.status === 'processing' && (
                          <Button size="sm">
                            Process Payment
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          View Receipt
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appeals">
            <Card>
              <CardHeader>
                <CardTitle>Claims Appeals</CardTitle>
                <CardDescription>Manage appeals for rejected claims</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appeals.map((appeal) => (
                    <div key={appeal.id} className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="font-semibold">{appeal.appealNumber}</h3>
                            <p className="text-sm text-muted-foreground">Original: {appeal.originalClaimNumber}</p>
                          </div>
                          <Badge className={getClaimStatusColor(appeal.status)}>
                            {appeal.status.replace('-', ' ')}
                          </Badge>
                          <span className="text-lg font-bold text-primary">
                            {formatCurrency(appeal.originalAmount)}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {appeal.status === 'under-review' && (
                            <Button size="sm">
                              Review Appeal
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            View Documents
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Appeal Information</p>
                          <p className="text-sm">Patient: <span className="font-medium">{appeal.patientName}</span></p>
                          <p className="text-sm">Appeal Date: <span className="font-medium">{appeal.appealDate}</span></p>
                          <p className="text-sm">Reviewer: <span className="font-medium">{appeal.reviewer}</span></p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Appeal Reason</p>
                          <p className="text-sm font-medium mb-2">{appeal.appealReason}</p>
                          <div className="flex flex-wrap gap-1">
                            {appeal.documents.map((doc, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {doc}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Claims Reports</CardTitle>
                <CardDescription>Generate comprehensive claims and financial reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-24 flex-col">
                    <FileText className="h-6 w-6 mb-2" />
                    <span>Claims Summary</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <Banknote className="h-6 w-6 mb-2" />
                    <span>Financial Report</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <Clock className="h-6 w-6 mb-2" />
                    <span>Processing Times</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <CheckCircle className="h-6 w-6 mb-2" />
                    <span>Approval Rates</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <AlertTriangle className="h-6 w-6 mb-2" />
                    <span>Rejection Analysis</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <FileText className="h-6 w-6 mb-2" />
                    <span>Appeals Report</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <SubmitClaimDialog 
        open={submitClaimOpen}
        onOpenChange={setSubmitClaimOpen}
      />
    </DashboardLayout>
  );
};

export default Claims;