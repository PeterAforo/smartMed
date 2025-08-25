import { useState } from "react"
import { Plus, Calendar, User, AlertTriangle, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { format } from "date-fns"
import { NewMedicalRecordDialog } from "./NewMedicalRecordDialog"

interface MedicalRecordsTabProps {
  patientId: string
}

export function MedicalRecordsTab({ patientId }: MedicalRecordsTabProps) {
  const [showNewRecord, setShowNewRecord] = useState(false)

  const { data: medicalRecords, isLoading, refetch } = useQuery({
    queryKey: ['medical-records', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medical_records')
        .select(`
          *,
          recorded_by_profile:profiles(first_name, last_name)
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    }
  })

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'secondary'
      case 'medium': return 'default'
      case 'low': return 'outline'
      default: return 'outline'
    }
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
        <h3 className="text-lg font-semibold">Medical Records</h3>
        <Button onClick={() => setShowNewRecord(true)} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New Record
        </Button>
      </div>

      <ScrollArea className="h-[500px]">
        <div className="space-y-4">
          {medicalRecords?.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No medical records found</p>
                  <p className="text-sm">Start by adding the first medical record for this patient.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            medicalRecords?.map((record) => (
              <Card key={record.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base">{record.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(record.created_at), 'MMM dd, yyyy')}
                        </div>
                        {record.recorded_by_profile && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {(record.recorded_by_profile as any)?.first_name} {(record.recorded_by_profile as any)?.last_name}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityBadgeVariant(record.severity)}>
                        {record.severity}
                      </Badge>
                      <Badge variant="outline">{record.record_type}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {record.description && (
                    <p className="text-sm mb-3">{record.description}</p>
                  )}
                  
                  {record.diagnosis_codes && Array.isArray(record.diagnosis_codes) && record.diagnosis_codes.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium mb-2">Diagnosis Codes:</h4>
                      <div className="flex flex-wrap gap-1">
                        {(record.diagnosis_codes as string[]).map((code: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {code}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {record.treatment_plan && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium mb-2">Treatment Plan:</h4>
                      <p className="text-sm text-muted-foreground">{record.treatment_plan}</p>
                    </div>
                  )}

                  {record.follow_up_notes && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Follow-up Notes:</h4>
                      <p className="text-sm text-muted-foreground">{record.follow_up_notes}</p>
                    </div>
                  )}

                  {record.status === 'critical' && (
                    <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <p className="text-sm font-medium text-destructive">Critical condition requires immediate attention</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      <NewMedicalRecordDialog
        open={showNewRecord}
        onOpenChange={setShowNewRecord}
        patientId={patientId}
        onSuccess={() => {
          refetch()
          setShowNewRecord(false)
        }}
      />
    </div>
  )
}