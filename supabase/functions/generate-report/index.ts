import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReportRequest {
  reportType: 'daily' | 'weekly' | 'monthly' | 'custom'
  startDate: string
  endDate: string
  branchId?: string
  includeCharts: boolean
  format: 'pdf' | 'html'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { reportType, startDate, endDate, branchId, includeCharts, format }: ReportRequest = await req.json()

    console.log(`Generating ${reportType} report from ${startDate} to ${endDate}`)

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

    // Fetch analytics data
    const [appointmentData, revenueData, patientFlowData, queueData] = await Promise.all([
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
        .eq(branchId ? 'branch_id' : 'tenant_id', branchId || profile.tenant_id)
    ])

    if (appointmentData.error || revenueData.error || patientFlowData.error || queueData.error) {
      throw new Error('Failed to fetch analytics data')
    }

    // Generate HTML report
    const htmlReport = generateHTMLReport({
      reportType,
      startDate,
      endDate,
      appointments: appointmentData.data || [],
      revenue: revenueData.data || [],
      patientFlow: patientFlowData.data || [],
      queue: queueData.data || [],
      includeCharts
    })

    if (format === 'html') {
      return new Response(htmlReport, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'text/html'
        }
      })
    }

    // For PDF, return HTML with print styles (client will handle PDF generation)
    const printableHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Healthcare Analytics Report</title>
        <style>
          @page { margin: 20mm; size: A4; }
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .section { margin-bottom: 30px; page-break-inside: avoid; }
          .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
          .metric-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
          .metric-value { font-size: 24px; font-weight: bold; color: #2563eb; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        ${htmlReport}
      </body>
      </html>
    `

    return new Response(printableHTML, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/html'
      }
    })

  } catch (error) {
    console.error('Report generation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      }
    )
  }
})

function generateHTMLReport(data: any): string {
  const { reportType, startDate, endDate, appointments, revenue, patientFlow, queue } = data
  
  // Calculate summary metrics
  const totalAppointments = appointments.reduce((sum: number, day: any) => sum + (day.total_appointments || 0), 0)
  const completedAppointments = appointments.reduce((sum: number, day: any) => sum + (day.completed_appointments || 0), 0)
  const totalRevenue = revenue.reduce((sum: number, month: any) => sum + (month.total_revenue || 0), 0)
  const newPatients = patientFlow.reduce((sum: number, month: any) => sum + (month.new_patients || 0), 0)
  const avgWaitTime = queue.length > 0 ? queue.reduce((sum: number, day: any) => sum + (day.avg_wait_time || 0), 0) / queue.length : 0

  return `
    <div class="header">
      <h1>Healthcare Analytics Report</h1>
      <p><strong>Report Type:</strong> ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}</p>
      <p><strong>Period:</strong> ${startDate} to ${endDate}</p>
      <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
    </div>

    <div class="section">
      <h2>Executive Summary</h2>
      <div class="metric-grid">
        <div class="metric-card">
          <h3>Total Appointments</h3>
          <div class="metric-value">${totalAppointments}</div>
          <p>Completion Rate: ${totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0}%</p>
        </div>
        <div class="metric-card">
          <h3>Total Revenue</h3>
          <div class="metric-value">$${totalRevenue.toLocaleString()}</div>
          <p>Average per appointment: $${totalAppointments > 0 ? Math.round(totalRevenue / totalAppointments) : 0}</p>
        </div>
        <div class="metric-card">
          <h3>New Patients</h3>
          <div class="metric-value">${newPatients}</div>
          <p>Patient acquisition</p>
        </div>
        <div class="metric-card">
          <h3>Average Wait Time</h3>
          <div class="metric-value">${Math.round(avgWaitTime / 60)} min</div>
          <p>Queue performance</p>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Appointment Analytics</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Total</th>
            <th>Completed</th>
            <th>No Show</th>
            <th>Cancelled</th>
            <th>Unique Patients</th>
          </tr>
        </thead>
        <tbody>
          ${appointments.map((day: any) => `
            <tr>
              <td>${day.date}</td>
              <td>${day.total_appointments || 0}</td>
              <td>${day.completed_appointments || 0}</td>
              <td>${day.no_show_appointments || 0}</td>
              <td>${day.cancelled_appointments || 0}</td>
              <td>${day.unique_patients || 0}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>Revenue Analytics</h2>
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Total Revenue</th>
            <th>Transactions</th>
            <th>Avg Transaction</th>
            <th>Paid Revenue</th>
            <th>Pending Revenue</th>
          </tr>
        </thead>
        <tbody>
          ${revenue.map((month: any) => `
            <tr>
              <td>${month.month}</td>
              <td>$${(month.total_revenue || 0).toLocaleString()}</td>
              <td>${month.total_transactions || 0}</td>
              <td>$${Math.round(month.avg_transaction_amount || 0)}</td>
              <td>$${(month.paid_revenue || 0).toLocaleString()}</td>
              <td>$${(month.pending_revenue || 0).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>Patient Flow Analytics</h2>
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>New Patients</th>
            <th>Active Patients</th>
            <th>Pediatric</th>
            <th>Senior</th>
          </tr>
        </thead>
        <tbody>
          ${patientFlow.map((month: any) => `
            <tr>
              <td>${month.month}</td>
              <td>${month.new_patients || 0}</td>
              <td>${month.active_patients || 0}</td>
              <td>${month.pediatric_patients || 0}</td>
              <td>${month.senior_patients || 0}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `
}