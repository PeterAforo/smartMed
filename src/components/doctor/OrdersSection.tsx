import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TestTube, Camera, Stethoscope, Plus, Save, Clock, Trash2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOrders } from '@/hooks/useOrders';
import { api } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface OrdersSectionProps {
  patientId: string;
  encounterId: string | null;
}

interface OrderItem {
  id: string;
  orderType: 'lab' | 'imaging' | 'procedure';
  orderCode: string;
  orderName: string;
  category: string;
  instructions: string;
  priority: 'routine' | 'urgent' | 'stat';
  scheduledFor?: string;
}

interface OrderData {
  orderType: 'lab' | 'imaging' | 'procedure';
  orderCode: string;
  instructions: string;
  priority: 'routine' | 'urgent' | 'stat';
  scheduledFor?: string;
}

export const OrdersSection = ({ 
  patientId, 
  encounterId 
}: OrdersSectionProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { createOrder, isCreating } = useOrders();
  const [activeOrderType, setActiveOrderType] = useState<'lab' | 'imaging' | 'procedure'>('lab');
  const [pendingOrders, setPendingOrders] = useState<OrderItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderData, setOrderData] = useState<OrderData>({
    orderType: 'lab',
    orderCode: '',
    instructions: '',
    priority: 'routine'
  });

  // Fetch existing orders for this patient
  const { data: existingLabOrders = [] } = useQuery({
    queryKey: ['lab', 'orders', patientId],
    queryFn: () => api.getLabOrders({ patient_id: patientId }),
    enabled: !!patientId
  });

  // Mock order templates
  const labTests = [
    { code: 'CBC', name: 'Complete Blood Count', category: 'Hematology' },
    { code: 'BMP', name: 'Basic Metabolic Panel', category: 'Chemistry' },
    { code: 'LFT', name: 'Liver Function Tests', category: 'Chemistry' },
    { code: 'UA', name: 'Urinalysis', category: 'Urinalysis' },
    { code: 'HbA1c', name: 'Hemoglobin A1c', category: 'Chemistry' },
    { code: 'TSH', name: 'Thyroid Stimulating Hormone', category: 'Endocrinology' },
    { code: 'PT/INR', name: 'Prothrombin Time/INR', category: 'Coagulation' }
  ];

  const imagingStudies = [
    { code: 'CXR', name: 'Chest X-Ray', category: 'Plain Film' },
    { code: 'ABD-US', name: 'Abdominal Ultrasound', category: 'Ultrasound' },
    { code: 'CT-HEAD', name: 'CT Head without contrast', category: 'CT' },
    { code: 'MRI-SPINE', name: 'MRI Lumbar Spine', category: 'MRI' },
    { code: 'ECHO', name: 'Echocardiogram', category: 'Cardiac' },
    { code: 'MAMMO', name: 'Mammography', category: 'Breast Imaging' }
  ];

  const procedures = [
    { code: 'EKG', name: 'Electrocardiogram', category: 'Cardiac' },
    { code: 'SPIROMETRY', name: 'Pulmonary Function Test', category: 'Pulmonary' },
    { code: 'STRESS', name: 'Cardiac Stress Test', category: 'Cardiac' },
    { code: 'COLONOSCOPY', name: 'Colonoscopy', category: 'GI' },
    { code: 'BIOPSY', name: 'Tissue Biopsy', category: 'Pathology' }
  ];

  const getOrderOptions = () => {
    switch (activeOrderType) {
      case 'lab':
        return labTests;
      case 'imaging':
        return imagingStudies;
      case 'procedure':
        return procedures;
      default:
        return [];
    }
  };

  const handleCreateOrder = async () => {
    if (!encounterId) {
      toast({
        title: "No Active Encounter",
        description: "Please start the consultation first.",
        variant: "destructive"
      });
      return;
    }

    if (!orderData.orderCode) {
      toast({
        title: "Missing Information",
        description: "Please select an order.",
        variant: "destructive"
      });
      return;
    }

    try {
      const selectedOrder = getOrderOptions().find(opt => opt.code === orderData.orderCode);
      const orderPayload = {
        patient_id: patientId,
        encounter_id: encounterId,
        order_type: orderData.orderType,
        order_name: selectedOrder?.name || orderData.orderCode,
        order_code: orderData.orderCode,
        instructions: orderData.instructions,
        priority: orderData.priority,
        scheduled_for: orderData.scheduledFor
      };

      createOrder(orderPayload, {
        onSuccess: () => {
          toast({
            title: "Order Created",
            description: `${orderData.orderType.toUpperCase()} order created successfully.`
          });
          // Reset form
          setOrderData({
            orderType: activeOrderType,
            orderCode: '',
            instructions: '',
            priority: 'routine'
          });
        }
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive"
      });
    }
  };

  const renderOrderForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Order Type</Label>
          <Select 
            value={orderData.orderCode} 
            onValueChange={(value) => setOrderData(prev => ({ ...prev, orderCode: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${activeOrderType} order`} />
            </SelectTrigger>
            <SelectContent>
              {getOrderOptions().map((option) => (
                <SelectItem key={option.code} value={option.code}>
                  <div>
                    <div className="font-medium">{option.name}</div>
                    <div className="text-sm text-muted-foreground">{option.category}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <Select 
            value={orderData.priority} 
            onValueChange={(value: 'routine' | 'urgent' | 'stat') => 
              setOrderData(prev => ({ ...prev, priority: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="routine">Routine</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="stat">STAT</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {orderData.orderType === 'imaging' && (
        <div className="space-y-2">
          <Label>Scheduled Date & Time</Label>
          <Input
            type="datetime-local"
            value={orderData.scheduledFor || ''}
            onChange={(e) => setOrderData(prev => ({ ...prev, scheduledFor: e.target.value }))}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label>Clinical Indication & Instructions</Label>
        <Textarea
          placeholder="Enter clinical indication and any special instructions..."
          value={orderData.instructions}
          onChange={(e) => setOrderData(prev => ({ ...prev, instructions: e.target.value }))}
          rows={4}
        />
      </div>

      <Button 
        onClick={handleCreateOrder} 
        disabled={isCreating || !orderData.orderCode}
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" />
        {isCreating ? 'Creating Order...' : `Create ${activeOrderType.toUpperCase()} Order`}
      </Button>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Order Management
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Create laboratory, imaging, and procedure orders for this patient
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs 
          value={activeOrderType} 
          onValueChange={(value: 'lab' | 'imaging' | 'procedure') => {
            setActiveOrderType(value);
            setOrderData(prev => ({ ...prev, orderType: value, orderCode: '' }));
          }}
          className="h-full flex flex-col"
        >
          <div className="border-b px-6 py-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="lab" className="flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                Laboratory
              </TabsTrigger>
              <TabsTrigger value="imaging" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Imaging
              </TabsTrigger>
              <TabsTrigger value="procedure" className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Procedures
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <TabsContent value="lab" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    Laboratory Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderOrderForm()}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="imaging" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Imaging Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderOrderForm()}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="procedure" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Procedure Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderOrderForm()}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};