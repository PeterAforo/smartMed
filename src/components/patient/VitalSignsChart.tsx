import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { format } from "date-fns"

interface VitalSignsChartProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vitalSigns: any[]
}

export function VitalSignsChart({ open, onOpenChange, vitalSigns }: VitalSignsChartProps) {
  // Process data for charts - reverse to show chronological order
  const chartData = vitalSigns
    .slice()
    .reverse()
    .map((vital, index) => ({
      date: format(new Date(vital.recorded_at), 'MM/dd'),
      time: format(new Date(vital.recorded_at), 'HH:mm'),
      systolic: vital.blood_pressure_systolic,
      diastolic: vital.blood_pressure_diastolic,
      heartRate: vital.heart_rate,
      temperature: vital.temperature,
      respiratoryRate: vital.respiratory_rate,
      oxygenSaturation: vital.oxygen_saturation,
      weight: vital.weight_kg,
      bmi: vital.bmi,
      index
    }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`${data.date} ${data.time}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}${getUnit(entry.dataKey)}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const getUnit = (dataKey: string) => {
    switch (dataKey) {
      case 'systolic':
      case 'diastolic':
        return ' mmHg'
      case 'heartRate':
        return ' bpm'
      case 'temperature':
        return '°C'
      case 'respiratoryRate':
        return '/min'
      case 'oxygenSaturation':
        return '%'
      case 'weight':
        return ' kg'
      case 'bmi':
        return ''
      default:
        return ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vital Signs Trends</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Blood Pressure Chart */}
          {chartData.some(d => d.systolic || d.diastolic) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Blood Pressure</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[60, 180]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="systolic" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="Systolic"
                      connectNulls={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="diastolic" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Diastolic"
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Heart Rate Chart */}
          {chartData.some(d => d.heartRate) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Heart Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[40, 120]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="heartRate" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Heart Rate"
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Temperature Chart */}
          {chartData.some(d => d.temperature) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Temperature</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[35, 42]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="temperature" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      name="Temperature"
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Weight and BMI Chart */}
          {chartData.some(d => d.weight || d.bmi) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {chartData.some(d => d.weight) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Weight</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Line 
                          type="monotone" 
                          dataKey="weight" 
                          stroke="#8b5cf6" 
                          strokeWidth={2}
                          name="Weight"
                          connectNulls={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {chartData.some(d => d.bmi) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">BMI</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[15, 40]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line 
                          type="monotone" 
                          dataKey="bmi" 
                          stroke="#ec4899" 
                          strokeWidth={2}
                          name="BMI"
                          connectNulls={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Other Vitals Chart */}
          {chartData.some(d => d.respiratoryRate || d.oxygenSaturation) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Respiratory Rate & Oxygen Saturation</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {chartData.some(d => d.respiratoryRate) && (
                      <Line 
                        type="monotone" 
                        dataKey="respiratoryRate" 
                        stroke="#06b6d4" 
                        strokeWidth={2}
                        name="Respiratory Rate"
                        connectNulls={false}
                      />
                    )}
                    {chartData.some(d => d.oxygenSaturation) && (
                      <Line 
                        type="monotone" 
                        dataKey="oxygenSaturation" 
                        stroke="#f97316" 
                        strokeWidth={2}
                        name="Oxygen Saturation"
                        connectNulls={false}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
