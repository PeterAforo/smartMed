import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Search, FileText, Banknote, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Insurance = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [insurancePolicies] = useState([
    {
      id: 1,
      patientName: 'John Doe',
      patientId: 'P001',
      policyNumber: 'NHIS-2024-001',
      provider: 'National Health Insurance',
      policyType: 'Comprehensive',
      coverageLimit: 50000.00,
      deductible: 500.00,
      copayment: 20,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'active',
      dependents: 3
    },
    {
      id: 2,
      patientName: 'Jane Smith',
      patientId: 'P002',
      policyNumber: 'PVT-2024-002',
      provider: 'Private Health Plus',
      policyType: 'Premium',
      coverageLimit: 100000.00,
      deductible: 1000.00,
      copayment: 15,
      startDate: '2024-01-15',
      endDate: '2025-01-14',
      status: 'active',
      dependents: 1
    },
    {
      id: 3,
      patientName: 'Mike Johnson',
      patientId: 'P003',
      policyNumber: 'COR-2024-003',
      provider: 'Corporate Insurance Ltd',
      policyType: 'Group',
      coverageLimit: 75000.00,
      deductible: 250.00,
      copayment: 10,
      startDate: '2023-12-01',
      endDate: '2024-11-30',
      status: 'expiring',
      dependents: 2
    }
  ]);

  const [verificationQueue] = useState([
    {
      id: 1,
      patientName: 'Sarah Davis',
      patientId: 'P004',
      policyNumber: 'NHIS-2024-004',
      provider: 'National Health Insurance',
      serviceDate: '2024-01-15',
      serviceType: 'Emergency Treatment',
      amount: 1250.00,
      status: 'pending',
      submittedDate: '2024-01-15',
      urgency: 'high'
    },
    {
      id: 2,
      patientName: 'Robert Wilson',
      patientId: 'P005',
      policyNumber: 'PVT-2024-005',
      provider: 'Private Health Plus',
      serviceDate: '2024-01-14',
      serviceType: 'Routine Checkup',
      amount: 350.00,
      status: 'verifying',
      submittedDate: '2024-01-14',
      urgency: 'routine'
    },
    {
      id: 3,
      patientName: 'Emily Brown',
      patientId: 'P006',
      policyNumber: 'COR-2024-006',
      provider: 'Corporate Insurance Ltd',
      serviceDate: '2024-01-13',
      serviceType: 'Surgery',
      amount: 5500.00,
      status: 'approved',
      submittedDate: '2024-01-13',
      urgency: 'routine'
    }
  ]);

  const [preAuthorizations] = useState([
    {
      id: 1,
      patientName: 'Alice Cooper',
      policyNumber: 'NHIS-2024-007',
      procedure: 'MRI Scan',
      estimatedCost: 1500.00,
      requestDate: '2024-01-15',
      status: 'pending',
      provider: 'National Health Insurance',
      doctor: 'Dr. Smith'
    },
    {
      id: 2,
      patientName: 'David Miller',
      policyNumber: 'PVT-2024-008',
      procedure: 'Cardiac Surgery',
      estimatedCost: 25000.00,
      requestDate: '2024-01-14',
      status: 'approved',
      provider: 'Private Health Plus',
      doctor: 'Dr. Johnson'
    }
  ]);

  const [stats] = useState({
    activePolicies: 156,
    pendingVerifications: 23,
    approvedClaims: 89,
    rejectedClaims: 12,
    totalCoverage: 15750000.00,
    monthlyPremiums: 125000.00
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'expiring': return 'bg-orange-100 text-orange-800';
      case 'suspended': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'verifying': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'routine': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleVerifyInsurance = (verificationId: number) => {
    toast({
      title: "Insurance Verified",
      description: "Insurance coverage has been verified successfully."
    });
  };

  const handleApproveAuthorization = (authId: number) => {
    toast({
      title: "Pre-authorization Approved",
      description: "Pre-authorization request has been approved."
    });
  };

  const formatCurrency = (amount: number) => {
    return `₵${amount.toLocaleString('en-GH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const filteredPolicies = insurancePolicies.filter(policy =>
    policy.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Insurance Management
          </h1>
          <p className="text-muted-foreground">Manage insurance policies, verify coverage, and process claims</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Policies</p>
                  <p className="text-2xl font-bold text-primary">{stats.activePolicies}</p>
                </div>
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Verifications</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingVerifications}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved Claims</p>
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
                  <p className="text-sm text-muted-foreground">Rejected Claims</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejectedClaims}</p>
                </div>
                <FileText className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Coverage</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalCoverage)}</p>
                </div>
                <Banknote className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Premiums</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.monthlyPremiums)}</p>
                </div>
                <Banknote className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="policies" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="policies">Insurance Policies</TabsTrigger>
            <TabsTrigger value="verification">Coverage Verification</TabsTrigger>
            <TabsTrigger value="authorization">Pre-Authorization</TabsTrigger>
          </TabsList>

          <TabsContent value="policies">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Insurance Policies</CardTitle>
                    <CardDescription>Manage patient insurance policies and coverage details</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search policies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPolicies.map((policy) => (
                    <div key={policy.id} className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="font-semibold">{policy.patientName}</h3>
                            <p className="text-sm text-muted-foreground">Policy: {policy.policyNumber}</p>
                          </div>
                          <Badge variant="outline">{policy.policyType}</Badge>
                          <Badge className={getStatusColor(policy.status)}>
                            {policy.status}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm">
                            <Shield className="mr-2 h-4 w-4" />
                            Verify Coverage
                          </Button>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Provider</p>
                          <p className="font-medium">{policy.provider}</p>
                          <p className="text-sm text-muted-foreground mt-2">Patient ID: {policy.patientId}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Coverage Details</p>
                          <p className="text-sm">Limit: <span className="font-medium">{formatCurrency(policy.coverageLimit)}</span></p>
                          <p className="text-sm">Deductible: <span className="font-medium">{formatCurrency(policy.deductible)}</span></p>
                          <p className="text-sm">Copay: <span className="font-medium">{policy.copayment}%</span></p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Policy Period</p>
                          <p className="text-sm">Start: <span className="font-medium">{policy.startDate}</span></p>
                          <p className="text-sm">End: <span className="font-medium">{policy.endDate}</span></p>
                          <p className="text-sm">Dependents: <span className="font-medium">{policy.dependents}</span></p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification">
            <Card>
              <CardHeader>
                <CardTitle>Coverage Verification Queue</CardTitle>
                <CardDescription>Verify insurance coverage for patient services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {verificationQueue.map((verification) => (
                    <div key={verification.id} className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="font-semibold">{verification.patientName}</h3>
                            <p className="text-sm text-muted-foreground">Policy: {verification.policyNumber}</p>
                          </div>
                          <Badge className={getStatusColor(verification.status)}>
                            {verification.status}
                          </Badge>
                          <Badge className={getUrgencyColor(verification.urgency)}>
                            {verification.urgency}
                          </Badge>
                          <span className="text-lg font-bold text-primary">
                            {formatCurrency(verification.amount)}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {verification.status === 'pending' && (
                            <Button 
                              size="sm"
                              onClick={() => handleVerifyInsurance(verification.id)}
                            >
                              Start Verification
                            </Button>
                          )}
                          {verification.status === 'verifying' && (
                            <Button size="sm" variant="outline">
                              Complete Verification
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Service Information</p>
                          <p className="text-sm">Type: <span className="font-medium">{verification.serviceType}</span></p>
                          <p className="text-sm">Date: <span className="font-medium">{verification.serviceDate}</span></p>
                          <p className="text-sm">Patient ID: <span className="font-medium">{verification.patientId}</span></p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Provider</p>
                          <p className="font-medium">{verification.provider}</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Submitted: {verification.submittedDate}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Amount</p>
                          <p className="text-xl font-bold text-green-600">
                            {formatCurrency(verification.amount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="authorization">
            <Card>
              <CardHeader>
                <CardTitle>Pre-Authorization Requests</CardTitle>
                <CardDescription>Manage pre-authorization requests for procedures</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {preAuthorizations.map((auth) => (
                    <div key={auth.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold">{auth.patientName}</h3>
                          <Badge className={getStatusColor(auth.status)}>
                            {auth.status}
                          </Badge>
                          <span className="text-lg font-bold text-primary">
                            {formatCurrency(auth.estimatedCost)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Policy: {auth.policyNumber} • Provider: {auth.provider}
                        </p>
                        <p className="text-sm text-muted-foreground mb-1">
                          Procedure: {auth.procedure} • Doctor: {auth.doctor}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Request Date: {auth.requestDate}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        {auth.status === 'pending' && (
                          <Button 
                            size="sm"
                            onClick={() => handleApproveAuthorization(auth.id)}
                          >
                            Approve
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Insurance;