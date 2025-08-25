-- First migration: Add missing roles to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'doctor';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'nurse'; 
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'lab_technician';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'billing';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'receptionist';