import { pool } from './db.js';
import dotenv from 'dotenv';

dotenv.config();

const migrations = `
-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS beds CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS revenue CASCADE;

-- Drop types if they exist
DROP TYPE IF EXISTS app_role CASCADE;

-- Create enum for user roles
CREATE TYPE app_role AS ENUM ('admin', 'doctor', 'nurse', 'lab_tech', 'pharmacist', 'receptionist', 'cashier', 'radiologist', 'manager');

-- Create users table (replacing Supabase auth.users)
CREATE TABLE users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  employee_id TEXT UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  department TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create patients table
CREATE TABLE patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_number TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  phone TEXT,
  email TEXT,
  address TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  medical_history JSONB DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  current_medications JSONB DEFAULT '[]',
  insurance_info JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deceased')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES users(id)
);

-- Create beds table
CREATE TABLE beds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bed_number TEXT NOT NULL UNIQUE,
  room_number TEXT,
  department TEXT,
  bed_type TEXT NOT NULL DEFAULT 'standard' CHECK (bed_type IN ('standard', 'icu', 'emergency', 'surgery', 'maternity')),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved')),
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  admitted_at TIMESTAMP WITH TIME ZONE,
  expected_discharge TIMESTAMP WITH TIME ZONE,
  daily_rate DECIMAL(10,2) DEFAULT 0,
  features JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES users(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  appointment_type TEXT NOT NULL DEFAULT 'consultation' CHECK (appointment_type IN ('consultation', 'follow_up', 'emergency', 'surgery', 'lab_test', 'imaging')),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  chief_complaint TEXT,
  notes TEXT,
  diagnosis JSONB DEFAULT '[]',
  treatment_plan TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  billing_amount DECIMAL(10,2) DEFAULT 0,
  insurance_claim_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES users(id)
);

-- Create activities table for system logging
CREATE TABLE activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('patient_created', 'appointment_scheduled', 'appointment_completed', 'bed_assigned', 'bed_released', 'alert_created', 'alert_resolved', 'revenue_recorded', 'user_login', 'user_logout')),
  entity_type TEXT CHECK (entity_type IN ('patient', 'appointment', 'bed', 'alert', 'revenue', 'user')),
  entity_id UUID,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create alerts table
CREATE TABLE alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('critical', 'warning', 'info', 'emergency')),
  priority INTEGER NOT NULL DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  entity_type TEXT CHECK (entity_type IN ('patient', 'bed', 'staff', 'equipment', 'system')),
  entity_id UUID,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'escalated')),
  acknowledged_by UUID REFERENCES users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  auto_resolve_at TIMESTAMP WITH TIME ZONE,
  escalation_level INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES users(id)
);

-- Create revenue table
CREATE TABLE revenue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  revenue_type TEXT NOT NULL CHECK (revenue_type IN ('consultation', 'procedure', 'medication', 'lab_test', 'imaging', 'bed_charges', 'other')),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'insurance', 'bank_transfer', 'other')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partially_paid', 'refunded', 'disputed')),
  invoice_number TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES users(id)
);

-- Create indexes for performance
CREATE INDEX idx_patients_status ON patients(status);
CREATE INDEX idx_patients_name ON patients(first_name, last_name);
CREATE INDEX idx_beds_status ON beds(status);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_staff ON appointments(staff_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_activities_created ON activities(created_at DESC);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_priority ON alerts(priority);
CREATE INDEX idx_revenue_date ON revenue(transaction_date);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beds_updated_at BEFORE UPDATE ON beds
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_revenue_updated_at BEFORE UPDATE ON revenue
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

async function migrate() {
  console.log('🚀 Starting database migration...');
  console.log('📡 Connecting to Neon PostgreSQL...');
  
  try {
    await pool.query(migrations);
    console.log('✅ Database migration completed successfully!');
    console.log('');
    console.log('Tables created:');
    console.log('  - users');
    console.log('  - user_roles');
    console.log('  - patients');
    console.log('  - beds');
    console.log('  - appointments');
    console.log('  - activities');
    console.log('  - alerts');
    console.log('  - revenue');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
