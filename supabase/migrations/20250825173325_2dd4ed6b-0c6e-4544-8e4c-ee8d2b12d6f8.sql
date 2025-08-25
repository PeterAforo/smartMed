-- Insert sample AI insights data for testing
INSERT INTO public.ai_insights (
  tenant_id,
  branch_id,
  title,
  description,
  insight_type,
  priority,
  confidence_score,
  is_actionable,
  action_taken,
  metrics,
  recommendations,
  data_sources,
  expires_at
) VALUES 
-- High Priority Actionable Insights
(
  (SELECT id FROM public.tenants WHERE code = 'DEFAULT' LIMIT 1),
  (SELECT id FROM public.branches LIMIT 1),
  'Critical Bed Shortage Alert',
  'Emergency department is experiencing 95% occupancy with a 3-hour average wait time. Immediate action required to optimize patient flow and consider temporary bed expansion.',
  'patient_flow',
  'high',
  0.94,
  true,
  false,
  '{"current_occupancy": 95, "average_wait_time_hours": 3, "critical_threshold": 85}',
  '["Deploy additional nursing staff to ED", "Open overflow area in wing B", "Contact partner hospitals for patient transfers"]',
  '["bed_management_system", "patient_tracking", "staff_scheduling"]',
  now() + interval '24 hours'
),
(
  (SELECT id FROM public.tenants WHERE code = 'DEFAULT' LIMIT 1),
  (SELECT id FROM public.branches LIMIT 1),
  'Staff Allocation Mismatch',
  'ICU is understaffed during night shifts while general wards are overstaffed. Redistributing 2 nurses could improve patient care ratios by 40%.',
  'resource_management',
  'high',
  0.89,
  true,
  false,
  '{"icu_patient_ratio": 1.8, "general_ward_ratio": 0.6, "optimal_icu_ratio": 1.2}',
  '["Reassign 2 general ward nurses to ICU night shift", "Implement flexible staffing protocol", "Review shift patterns quarterly"]',
  '["staffing_system", "patient_acuity_tracking"]',
  now() + interval '48 hours'
),

-- Medium Priority Insights (Mix of actionable and completed)
(
  (SELECT id FROM public.tenants WHERE code = 'DEFAULT' LIMIT 1),
  (SELECT id FROM public.branches LIMIT 1),
  'Revenue Optimization Opportunity',
  'Analysis shows 15% increase in revenue potential by optimizing appointment scheduling during peak hours and reducing no-show rates.',
  'financial',
  'medium',
  0.82,
  true,
  true,
  '{"potential_revenue_increase": 15, "current_no_show_rate": 12, "peak_hour_utilization": 78}',
  '["Implement reminder system", "Optimize scheduling algorithm", "Introduce booking fees for peak hours"]',
  '["appointment_system", "financial_tracking", "patient_communication"]',
  now() + interval '7 days'
),
(
  (SELECT id FROM public.tenants WHERE code = 'DEFAULT' LIMIT 1),
  (SELECT id FROM public.branches LIMIT 1),
  'Equipment Utilization Pattern',
  'MRI machine shows 65% utilization rate with potential to increase to 85% by extending evening hours and improving scheduling efficiency.',
  'resource_management',
  'medium',
  0.76,
  true,
  false,
  '{"current_utilization": 65, "potential_utilization": 85, "evening_slots_available": 18}',
  '["Extend MRI hours until 10 PM", "Hire additional technician for evening shift", "Optimize appointment slots"]',
  '["equipment_tracking", "scheduling_system"]',
  now() + interval '5 days'
),

-- Quality Care Insights
(
  (SELECT id FROM public.tenants WHERE code = 'DEFAULT' LIMIT 1),
  (SELECT id FROM public.branches LIMIT 1),
  'Patient Satisfaction Trend Analysis',
  'Patient satisfaction scores have improved by 12% over the last quarter, particularly in communication and wait time categories.',
  'quality_care',
  'low',
  0.88,
  false,
  false,
  '{"satisfaction_improvement": 12, "communication_score": 4.2, "wait_time_score": 3.8}',
  '[]',
  '["patient_surveys", "feedback_system", "quality_metrics"]',
  now() + interval '30 days'
),
(
  (SELECT id FROM public.tenants WHERE code = 'DEFAULT' LIMIT 1),
  (SELECT id FROM public.branches LIMIT 1),
  'Readmission Risk Prediction',
  'Machine learning model identifies 23 patients at high risk of readmission within 30 days. Early intervention could reduce readmissions by 35%.',
  'quality_care',
  'medium',
  0.91,
  true,
  false,
  '{"high_risk_patients": 23, "predicted_reduction": 35, "model_accuracy": 91}',
  '["Schedule follow-up calls within 48 hours", "Provide discharge care packages", "Coordinate with primary care physicians"]',
  '["ehr_system", "predictive_analytics", "patient_outcomes"]',
  now() + interval '3 days'
),

-- Financial Performance Insights
(
  (SELECT id FROM public.tenants WHERE code = 'DEFAULT' LIMIT 1),
  (SELECT id FROM public.branches LIMIT 1),
  'Cost Reduction Opportunity',
  'Supply chain analysis reveals potential 8% cost savings through vendor consolidation and bulk purchasing agreements.',
  'financial',
  'medium',
  0.79,
  true,
  true,
  '{"potential_savings": 8, "current_vendor_count": 15, "recommended_vendor_count": 8}',
  '["Negotiate bulk purchasing agreements", "Consolidate suppliers", "Implement inventory management system"]',
  '["supply_chain_system", "financial_tracking", "vendor_management"]',
  now() + interval '14 days'
),

-- Patient Flow Insights
(
  (SELECT id FROM public.tenants WHERE code = 'DEFAULT' LIMIT 1),
  (SELECT id FROM public.branches LIMIT 1),
  'Appointment Scheduling Optimization',
  'Peak appointment times (10 AM - 2 PM) show 40% longer wait times. Redistributing appointments could improve patient flow and satisfaction.',
  'patient_flow',
  'low',
  0.73,
  true,
  false,
  '{"peak_wait_time_increase": 40, "optimal_distribution_improvement": 25, "current_peak_hours": "10-14"}',
  '["Encourage off-peak appointments with incentives", "Adjust provider schedules", "Implement dynamic scheduling"]',
  '["scheduling_system", "patient_flow_tracking"]',
  now() + interval '10 days'
),

-- Additional Resource Management Insight
(
  (SELECT id FROM public.tenants WHERE code = 'DEFAULT' LIMIT 1),
  (SELECT id FROM public.branches LIMIT 1),
  'Pharmacy Inventory Alert',
  'Critical medications showing low stock levels. Current inventory will last only 3 days based on consumption patterns.',
  'resource_management',
  'high',
  0.96,
  true,
  true,
  '{"days_remaining": 3, "critical_medications": 5, "reorder_threshold": 7}',
  '["Place emergency orders for critical medications", "Review reorder points", "Implement automated inventory alerts"]',
  '["pharmacy_system", "inventory_tracking"]',
  now() + interval '1 day'
);