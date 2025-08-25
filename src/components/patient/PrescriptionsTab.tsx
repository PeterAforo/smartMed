import { useState } from "react"
import { Plus, Calendar, User, Clock, AlertCircle, Pill } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { format, addDays, isAfter, isBefore } from "date-fns"
import { NewPrescriptionDialog } from "./NewPrescriptionDialog"

interface PrescriptionsTabProps {
  patientId: string
}

export function PrescriptionsTab({ patientId }: PrescriptionsTabProps) {
  const [showNewPrescription, setShowNewPrescription] = useState(false)

  const { data: prescriptions, isLoading, refetch } = useQuery({
    queryKey: ['prescriptions', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          *,
          prescribed_by_profile:profiles(first_name, last_name)
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    }
  })

  const getStatusBadgeVariant = (status: string, endDate: string | null) => {
    if (status === 'discontinued') return 'destructive'
    if (endDate && isAfter(new Date(), new Date(endDate))) return 'secondary'
    if (status === 'active') return 'default'
    return 'outline'
  }

  const getStatusText = (status: string, endDate: string | null) => {
    if (status === 'discontinued') return 'Discontinued'
    if (endDate && isAfter(new Date(), new Date(endDate))) return 'Expired'
    if (status === 'active') return 'Active'
    return status
  }

  const isExpiringSoon = (endDate: string | null) => {
    if (!endDate) return false
    const expiryDate = new Date(endDate)
    const warningDate = addDays(new Date(), 7) // 7 days warning
    return isAfter(expiryDate, new Date()) && isBefore(expiryDate, warningDate)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Prescriptions</h3>
        <Button onClick={() => setShowNewPrescription(true)} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New Prescription
        </Button>
      </div>

      <ScrollArea className="h-[500px]">
        <div className="space-y-4">
          {prescriptions?.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No prescriptions found</p>
                  <p className="text-sm">Start by adding the first prescription for this patient.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            prescriptions?.map((prescription) => (
              <Card key={prescription.id} className={isExpiringSoon(prescription.end_date) ? "border-warning" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base font-semibold">
                        {prescription.medication_name}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(prescription.start_date), 'MMM dd, yyyy')}
                        </div>
                        {prescription.prescribed_by_profile && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            Dr. {(prescription.prescribed_by_profile as any)?.first_name} {(prescription.prescribed_by_profile as any)?.last_name}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(prescription.status, prescription.end_date)}>
                        {getStatusText(prescription.status, prescription.end_date)}
                      </Badge>
                      {isExpiringSoon(prescription.end_date) && (
                        <Badge variant="outline" className="text-warning border-warning">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Expiring Soon
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Dosage</h4>
                      <p className="text-sm text-muted-foreground">{prescription.dosage}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">Frequency</h4>
                      <p className="text-sm text-muted-foreground">{prescription.frequency}</p>
                    </div>
                    {prescription.duration_days && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Duration</h4>
                        <p className="text-sm text-muted-foreground">{prescription.duration_days} days</p>
                      </div>
                    )}
                    {prescription.refills_remaining !== null && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Refills Remaining</h4>
                        <p className="text-sm text-muted-foreground">{prescription.refills_remaining}</p>
                      </div>
                    )}
                  </div>

                  {prescription.end_date && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-1">End Date</h4>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(prescription.end_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                  )}

                  {prescription.instructions && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-1">Instructions</h4>
                      <p className="text-sm text-muted-foreground">{prescription.instructions}</p>
                    </div>
                  )}

                  {prescription.pharmacy_info && typeof prescription.pharmacy_info === 'object' && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Pharmacy Information</h4>
                      <div className="text-sm text-muted-foreground">
                        {(prescription.pharmacy_info as any)?.name && <p>Name: {(prescription.pharmacy_info as any).name}</p>}
                        {(prescription.pharmacy_info as any)?.phone && <p>Phone: {(prescription.pharmacy_info as any).phone}</p>}
                        {(prescription.pharmacy_info as any)?.address && <p>Address: {(prescription.pharmacy_info as any).address}</p>}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      <NewPrescriptionDialog
        open={showNewPrescription}
        onOpenChange={setShowNewPrescription}
        patientId={patientId}
        onSuccess={() => {
          refetch()
          setShowNewPrescription(false)
        }}
      />
    </div>
  )
}