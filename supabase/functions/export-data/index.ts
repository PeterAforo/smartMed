import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExportRequest {
  dataType: 'appointments' | 'revenue' | 'patients' | 'queue' | 'all'
  format: 'csv' | 'json'
  startDate: string
  endDate: string
  branchId?: string
  filters?: Record<string, any>
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { dataType, format, startDate, endDate, branchId, filters }: ExportRequest = await req.json()

    console.log(`Exporting ${dataType} data as ${format} from ${startDate} to ${endDate}`)

    // Get user info from JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    // Get user's tenant
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('user_id', user.id)
      .single()

    if (!profile?.tenant_id) {
      throw new Error('User tenant not found')
    }

    let exportData: any[] = []
    let filename = ''

    switch (dataType) {
      case 'appointments':
        const { data: appointmentData } = await supabase.rpc('get_appointment_analytics', {
          start_date: startDate,
          end_date: endDate,
          target_tenant_id: profile.tenant_id,
          target_branch_id: branchId || null
        })
        exportData = appointmentData || []
        filename = `appointments_${startDate}_${endDate}`
        break

      case 'revenue':
        const { data: revenueData } = await supabase.rpc('get_revenue_analytics', {
          start_date: startDate,
          end_date: endDate,
          target_tenant_id: profile.tenant_id,
          target_branch_id: branchId || null
        })
        exportData = revenueData || []
        filename = `revenue_${startDate}_${endDate}`
        break

      case 'patients':
        const { data: patientData } = await supabase.rpc('get_patient_flow_analytics', {
          start_date: startDate,
          end_date: endDate,
          target_tenant_id: profile.tenant_id,
          target_branch_id: branchId || null
        })
        exportData = patientData || []
        filename = `patients_${startDate}_${endDate}`
        break

      case 'queue':
        const { data: queueData } = await supabase
          .from('analytics_queue_performance')
          .select('*')
          .eq('tenant_id', profile.tenant_id)
          .gte('date', startDate)
          .lte('date', endDate)
          .eq(branchId ? 'branch_id' : 'tenant_id', branchId || profile.tenant_id)
        exportData = queueData || []
        filename = `queue_${startDate}_${endDate}`
        break

      case 'all':
        // Export all data types combined
        const [appointments, revenue, patients, queue] = await Promise.all([
          supabase.rpc('get_appointment_analytics', {
            start_date: startDate,
            end_date: endDate,
            target_tenant_id: profile.tenant_id,
            target_branch_id: branchId || null
          }),
          supabase.rpc('get_revenue_analytics', {
            start_date: startDate,
            end_date: endDate,
            target_tenant_id: profile.tenant_id,
            target_branch_id: branchId || null
          }),
          supabase.rpc('get_patient_flow_analytics', {
            start_date: startDate,
            end_date: endDate,
            target_tenant_id: profile.tenant_id,
            target_branch_id: branchId || null
          }),
          supabase
            .from('analytics_queue_performance')
            .select('*')
            .eq('tenant_id', profile.tenant_id)
            .gte('date', startDate)
            .lte('date', endDate)
        ])
        
        exportData = {
          appointments: appointments.data || [],
          revenue: revenue.data || [],
          patients: patients.data || [],
          queue: queue.data || []
        }
        filename = `complete_analytics_${startDate}_${endDate}`
        break
    }

    if (format === 'json') {
      return new Response(JSON.stringify(exportData, null, 2), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}.json"`
        }
      })
    }

    // Generate CSV
    const csv = dataType === 'all' ? generateMultiSheetCSV(exportData) : generateCSV(exportData)
    
    return new Response(csv, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}.csv"`
      }
    })

  } catch (error) {
    console.error('Export error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      }
    )
  }
})

function generateCSV(data: any[]): string {
  if (!data.length) return ''
  
  const headers = Object.keys(data[0])
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        return typeof value === 'string' && value.includes(',') 
          ? `"${value.replace(/"/g, '""')}"` 
          : value
      }).join(',')
    )
  ]
  
  return csvRows.join('\n')
}

function generateMultiSheetCSV(data: any): string {
  let csv = ''
  
  Object.entries(data).forEach(([sheetName, sheetData]: [string, any]) => {
    csv += `\n--- ${sheetName.toUpperCase()} ---\n`
    if (Array.isArray(sheetData) && sheetData.length > 0) {
      csv += generateCSV(sheetData)
    }
    csv += '\n'
  })
  
  return csv
}