import { useState } from "react"
import { Plus, Calendar, User, TrendingUp, Activity, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { format } from "date-fns"
import { NewVitalSignsDialog } from "./NewVitalSignsDialog"
import { VitalSignsChart } from "./VitalSignsChart"

interface VitalSignsTabProps {
  patientId: string
}

export function VitalSignsTab({ patientId }: VitalSignsTabProps) {
  const [showNewVitalSigns, setShowNewVitalSigns] = useState(false)
  const [showChart, setShowChart] = useState(false)

  const { data: vitalSigns, isLoading, refetch } = useQuery({
    queryKey: ['vital-signs', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vital_signs')
        .select(`
          *,
          recorded_by_profile:profiles(first_name, last_name)
        `)
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false })
      
      if (error) throw error
      return data || []
    }
  })

  const getBloodPressureCategory = (systolic: number | null, diastolic: number | null) => {
    if (!systolic || !diastolic) return { category: 'Unknown', variant: 'outline' as const }
    
    if (systolic < 120 && diastolic < 80) return { category: 'Normal', variant: 'default' as const }
    if (systolic < 130 && diastolic < 80) return { category: 'Elevated', variant: 'secondary' as const }
    if ((systolic >= 130 && systolic < 140) || (diastolic >= 80 && diastolic < 90)) {
      return { category: 'Stage 1 HTN', variant: 'secondary' as const }
    }
    if (systolic >= 140 || diastolic >= 90) return { category: 'Stage 2 HTN', variant: 'destructive' as const }
    if (systolic >= 180 || diastolic >= 120) return { category: 'Hypertensive Crisis', variant: 'destructive' as const }
    
    return { category: 'Unknown', variant: 'outline' as const }
  }

  const getTemperatureStatus = (temp: number | null) => {
    if (!temp) return { status: 'Unknown', variant: 'outline' as const }
    
    // Convert to Fahrenheit if needed (assuming input is in Celsius)
    const tempF = temp > 50 ? temp : (temp * 9/5) + 32
    
    if (tempF < 97) return { status: 'Low', variant: 'secondary' as const }
    if (tempF <= 99.5) return { status: 'Normal', variant: 'default' as const }
    if (tempF <= 100.4) return { status: 'Low Fever', variant: 'secondary' as const }
    return { status: 'Fever', variant: 'destructive' as const }
  }

  const getHeartRateStatus = (hr: number | null) => {
    if (!hr) return { status: 'Unknown', variant: 'outline' as const }
    
    if (hr < 60) return { status: 'Bradycardia', variant: 'secondary' as const }
    if (hr <= 100) return { status: 'Normal', variant: 'default' as const }
    return { status: 'Tachycardia', variant: 'destructive' as const }
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
        <h3 className="text-lg font-semibold">Vital Signs</h3>
        <div className="flex gap-2">
          {vitalSigns && vitalSigns.length > 0 && (
            <Button
              onClick={() => setShowChart(true)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              View Trends
            </Button>
          )}
          <Button onClick={() => setShowNewVitalSigns(true)} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Record Vitals
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[500px]">
        <div className="space-y-4">
          {vitalSigns?.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No vital signs recorded</p>
                  <p className="text-sm">Start by recording the first set of vital signs for this patient.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            vitalSigns?.map((vitals) => {
              const bpCategory = getBloodPressureCategory(vitals.blood_pressure_systolic, vitals.blood_pressure_diastolic)
              const tempStatus = getTemperatureStatus(vitals.temperature)
              const hrStatus = getHeartRateStatus(vitals.heart_rate)

              return (
                <Card key={vitals.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">
                          Vital Signs Recording
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(vitals.recorded_at), 'MMM dd, yyyy HH:mm')}
                          </div>
                          {vitals.recorded_by_profile && (
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {(vitals.recorded_by_profile as any)?.first_name} {(vitals.recorded_by_profile as any)?.last_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {/* Blood Pressure */}
                      {(vitals.blood_pressure_systolic || vitals.blood_pressure_diastolic) && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-red-500" />
                            <span className="text-sm font-medium">Blood Pressure</span>
                          </div>
                          <p className="text-lg font-semibold">
                            {vitals.blood_pressure_systolic || '---'}/{vitals.blood_pressure_diastolic || '---'} mmHg
                          </p>
                          <Badge variant={bpCategory.variant} className="text-xs">
                            {bpCategory.category}
                          </Badge>
                        </div>
                      )}

                      {/* Heart Rate */}
                      {vitals.heart_rate && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">Heart Rate</span>
                          </div>
                          <p className="text-lg font-semibold">{vitals.heart_rate} bpm</p>
                          <Badge variant={hrStatus.variant} className="text-xs">
                            {hrStatus.status}
                          </Badge>
                        </div>
                      )}

                      {/* Temperature */}
                      {vitals.temperature && (
                        <div className="space-y-2">
                          <span className="text-sm font-medium">Temperature</span>
                          <p className="text-lg font-semibold">{vitals.temperature}°C</p>
                          <Badge variant={tempStatus.variant} className="text-xs">
                            {tempStatus.status}
                          </Badge>
                        </div>
                      )}

                      {/* Respiratory Rate */}
                      {vitals.respiratory_rate && (
                        <div className="space-y-2">
                          <span className="text-sm font-medium">Respiratory Rate</span>
                          <p className="text-lg font-semibold">{vitals.respiratory_rate} /min</p>
                          <Badge variant="outline" className="text-xs">
                            {vitals.respiratory_rate < 12 ? 'Low' : vitals.respiratory_rate > 20 ? 'High' : 'Normal'}
                          </Badge>
                        </div>
                      )}

                      {/* Oxygen Saturation */}
                      {vitals.oxygen_saturation && (
                        <div className="space-y-2">
                          <span className="text-sm font-medium">Oxygen Saturation</span>
                          <p className="text-lg font-semibold">{vitals.oxygen_saturation}%</p>
                          <Badge variant={vitals.oxygen_saturation < 95 ? 'destructive' : 'default'} className="text-xs">
                            {vitals.oxygen_saturation < 95 ? 'Low' : 'Normal'}
                          </Badge>
                        </div>
                      )}

                      {/* Weight */}
                      {vitals.weight_kg && (
                        <div className="space-y-2">
                          <span className="text-sm font-medium">Weight</span>
                          <p className="text-lg font-semibold">{vitals.weight_kg} kg</p>
                        </div>
                      )}

                      {/* Height */}
                      {vitals.height_cm && (
                        <div className="space-y-2">
                          <span className="text-sm font-medium">Height</span>
                          <p className="text-lg font-semibold">{vitals.height_cm} cm</p>
                        </div>
                      )}

                      {/* BMI */}
                      {vitals.bmi && (
                        <div className="space-y-2">
                          <span className="text-sm font-medium">BMI</span>
                          <p className="text-lg font-semibold">{vitals.bmi}</p>
                          <Badge variant={vitals.bmi < 18.5 ? 'secondary' : vitals.bmi > 30 ? 'destructive' : 'default'} className="text-xs">
                            {vitals.bmi < 18.5 ? 'Underweight' : vitals.bmi < 25 ? 'Normal' : vitals.bmi < 30 ? 'Overweight' : 'Obese'}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {vitals.notes && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Notes</h4>
                        <p className="text-sm text-muted-foreground">{vitals.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </ScrollArea>

      <NewVitalSignsDialog
        open={showNewVitalSigns}
        onOpenChange={setShowNewVitalSigns}
        patientId={patientId}
        onSuccess={() => {
          refetch()
          setShowNewVitalSigns(false)
        }}
      />

      {vitalSigns && vitalSigns.length > 0 && (
        <VitalSignsChart
          open={showChart}
          onOpenChange={setShowChart}
          vitalSigns={vitalSigns}
        />
      )}
    </div>
  )
}