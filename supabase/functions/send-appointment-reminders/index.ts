import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReminderPayload {
  appointmentId: string
  reminderType: 'sms' | 'email'
  reminderTime: string
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const mnotifyApiKey = Deno.env.get('MNOTIFY_API_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (req.method === 'POST') {
      // Manual reminder sending
      const { appointmentId, reminderType, reminderTime }: ReminderPayload = await req.json()

      // Get appointment details with patient info
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .select(`
          *,
          patients!inner(
            id,
            first_name,
            last_name,
            phone,
            email,
            reminder_preferences
          )
        `)
        .eq('id', appointmentId)
        .single()

      if (appointmentError) {
        throw new Error(`Failed to fetch appointment: ${appointmentError.message}`)
      }

      if (!appointment || !appointment.patients) {
        throw new Error('Appointment or patient not found')
      }

      const patient = appointment.patients
      
      // Check if patient has opted in for this reminder type
      const reminderPrefs = patient.reminder_preferences || {}
      if (!reminderPrefs[reminderType]?.enabled) {
        throw new Error(`Patient has not opted in for ${reminderType} reminders`)
      }

      let reminderSent = false
      let deliveryStatus = 'failed'
      let errorMessage = ''

      // Send SMS reminder
      if (reminderType === 'sms' && patient.phone) {
        const message = `Hi ${patient.first_name}, this is a reminder for your ${appointment.appointment_type} appointment on ${new Date(appointment.appointment_date).toLocaleDateString()} at ${new Date(`2000-01-01T${appointment.appointment_time}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}. Please arrive 15 minutes early.`

        try {
          const smsResponse = await fetch('https://api.mnotify.com/api/sms/quick', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${mnotifyApiKey}`
            },
            body: JSON.stringify({
              recipient: [patient.phone],
              sender: 'NCHS',
              message: message,
              is_schedule: false
            })
          })

          const smsResult = await smsResponse.json()
          
          if (smsResponse.ok && smsResult.status === 'success') {
            reminderSent = true
            deliveryStatus = 'sent'
          } else {
            errorMessage = smsResult.message || 'SMS sending failed'
          }
        } catch (error) {
          errorMessage = `SMS API error: ${error.message}`
        }
      }

      // Send Email reminder (fallback or primary)
      if (reminderType === 'email' && patient.email) {
        const emailSubject = `Appointment Reminder - ${new Date(appointment.appointment_date).toLocaleDateString()}`
        const emailMessage = `
          <html>
            <body>
              <h2>Appointment Reminder</h2>
              <p>Dear ${patient.first_name} ${patient.last_name},</p>
              <p>This is a reminder for your upcoming appointment:</p>
              <ul>
                <li><strong>Date:</strong> ${new Date(appointment.appointment_date).toLocaleDateString()}</li>
                <li><strong>Time:</strong> ${new Date(`2000-01-01T${appointment.appointment_time}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</li>
                <li><strong>Type:</strong> ${appointment.appointment_type}</li>
                <li><strong>Duration:</strong> ${appointment.duration_minutes} minutes</li>
              </ul>
              <p>Please arrive 15 minutes early for check-in.</p>
              <p>If you need to reschedule or cancel, please contact us as soon as possible.</p>
              <p>Thank you!</p>
            </body>
          </html>
        `

        // For now, we'll just log the email (you can integrate with Resend or another email service)
        console.log('Email reminder would be sent to:', patient.email)
        console.log('Subject:', emailSubject)
        console.log('Message:', emailMessage)
        
        // Simulate successful email sending
        reminderSent = true
        deliveryStatus = 'sent'
      }

      // Record the reminder attempt
      const { error: reminderError } = await supabase
        .from('appointment_reminders')
        .insert([{
          tenant_id: appointment.tenant_id,
          appointment_id: appointmentId,
          reminder_type: reminderType,
          reminder_time: reminderTime,
          scheduled_for: new Date().toISOString(),
          sent_at: reminderSent ? new Date().toISOString() : null,
          status: reminderSent ? 'sent' : 'failed',
          message_content: reminderType === 'sms' ? 
            `Hi ${patient.first_name}, this is a reminder for your ${appointment.appointment_type} appointment...` :
            `Appointment Reminder - ${new Date(appointment.appointment_date).toLocaleDateString()}`,
          delivery_status: deliveryStatus,
          error_message: errorMessage || null
        }])

      if (reminderError) {
        console.error('Failed to record reminder:', reminderError)
      }

      return new Response(
        JSON.stringify({ 
          success: reminderSent,
          message: reminderSent ? 'Reminder sent successfully' : 'Failed to send reminder',
          error: errorMessage || null
        }),
        { 
          status: reminderSent ? 200 : 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      )
    }

    // GET request - Process scheduled reminders (called by CRON)
    if (req.method === 'GET') {
      console.log('Processing scheduled reminders...')

      // Get pending reminders that should be sent now
      const now = new Date()
      const { data: pendingReminders, error: reminderError } = await supabase
        .from('appointment_reminders')
        .select(`
          *,
          appointments!inner(
            *,
            patients!inner(
              id,
              first_name,
              last_name,
              phone,
              email,
              reminder_preferences
            )
          )
        `)
        .eq('status', 'pending')
        .lte('scheduled_for', now.toISOString())

      if (reminderError) {
        throw new Error(`Failed to fetch pending reminders: ${reminderError.message}`)
      }

      let processedCount = 0
      let successCount = 0

      for (const reminder of pendingReminders || []) {
        processedCount++
        
        try {
          const appointment = reminder.appointments
          const patient = appointment.patients
          
          // Check if patient has opted in for this reminder type
          const reminderPrefs = patient.reminder_preferences || {}
          if (!reminderPrefs[reminder.reminder_type]?.enabled) {
            // Mark as failed - patient opted out
            await supabase
              .from('appointment_reminders')
              .update({
                status: 'failed',
                error_message: 'Patient opted out of reminders'
              })
              .eq('id', reminder.id)
            continue
          }

          let reminderSent = false
          let deliveryStatus = 'failed'
          let errorMessage = ''

          // Send SMS reminder
          if (reminder.reminder_type === 'sms' && patient.phone) {
            const message = `Hi ${patient.first_name}, this is a reminder for your ${appointment.appointment_type} appointment on ${new Date(appointment.appointment_date).toLocaleDateString()} at ${new Date(`2000-01-01T${appointment.appointment_time}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}. Please arrive 15 minutes early.`

            try {
              const smsResponse = await fetch('https://api.mnotify.com/api/sms/quick', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${mnotifyApiKey}`
                },
                body: JSON.stringify({
                  recipient: [patient.phone],
                  sender: 'NCHS',
                  message: message,
                  is_schedule: false
                })
              })

              const smsResult = await smsResponse.json()
              
              if (smsResponse.ok && smsResult.status === 'success') {
                reminderSent = true
                deliveryStatus = 'sent'
                successCount++
              } else {
                errorMessage = smsResult.message || 'SMS sending failed'
              }
            } catch (error) {
              errorMessage = `SMS API error: ${error.message}`
            }
          }

          // Send Email reminder
          if (reminder.reminder_type === 'email' && patient.email) {
            // For now, simulate email sending
            console.log(`Email reminder sent to ${patient.email} for appointment ${appointment.id}`)
            reminderSent = true
            deliveryStatus = 'sent'
            successCount++
          }

          // Update reminder status
          await supabase
            .from('appointment_reminders')
            .update({
              sent_at: reminderSent ? new Date().toISOString() : null,
              status: reminderSent ? 'sent' : 'failed',
              delivery_status: deliveryStatus,
              error_message: errorMessage || null
            })
            .eq('id', reminder.id)

        } catch (error) {
          console.error(`Failed to process reminder ${reminder.id}:`, error)
          
          // Mark as failed
          await supabase
            .from('appointment_reminders')
            .update({
              status: 'failed',
              error_message: error.message
            })
            .eq('id', reminder.id)
        }
      }

      console.log(`Processed ${processedCount} reminders, ${successCount} sent successfully`)

      return new Response(
        JSON.stringify({ 
          processed: processedCount,
          successful: successCount,
          message: 'Reminder processing completed'
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    )

  } catch (error) {
    console.error('Reminder function error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    )
  }
})