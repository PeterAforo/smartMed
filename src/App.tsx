import React from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Appointments from "./pages/Appointments";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";
import Communications from "./pages/Communications";
import Quality from "./pages/Quality";
import Settings from "./pages/Settings";
import ClinicalWorkflow from "./pages/ClinicalWorkflow";
import Mobile from "./pages/Mobile";
import Operations from "./pages/Operations";
import Finance from "./pages/Finance";
import Registration from "./pages/Registration";
import CheckIn from "./pages/CheckIn";
import Laboratory from "./pages/Laboratory";
import Pharmacy from "./pages/Pharmacy";
import Doctor from "./pages/Doctor";
import Nurse from "./pages/Nurse";
import Emergency from "./pages/Emergency";
import Inpatient from "./pages/Inpatient";
import Ward from "./pages/Ward";
import Accounts from "./pages/Accounts";
import Cashier from "./pages/Cashier";
import Inventory from "./pages/Inventory";
import Insurance from "./pages/Insurance";
import Claims from "./pages/Claims";
import Imaging from "./pages/Imaging";
import Radiology from "./pages/Radiology";
import Corporate from "./pages/Corporate";
import Stores from "./pages/Stores";
import HR from "./pages/HR";
import EMR from "./pages/EMR";
import Theatre from "./pages/Theatre";
import Obstetrics from "./pages/Obstetrics";
import PatientPortal from "./pages/PatientPortal";
import Telemedicine from "./pages/Telemedicine";
import Feedback from "./pages/Feedback";
import Audit from "./pages/Audit";
import Backup from "./pages/Backup";
import API from "./pages/API";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    window.location.href = '/auth';
    return null;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/patients" 
              element={
                <ProtectedRoute>
                  <Patients />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/appointments" 
              element={
                <ProtectedRoute>
                  <Appointments />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reports" 
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/communications" 
              element={
                <ProtectedRoute>
                  <Communications />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quality" 
              element={
                <ProtectedRoute>
                  <Quality />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/clinical-workflow" 
              element={
                <ProtectedRoute>
                  <ClinicalWorkflow />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/mobile" 
              element={
                <ProtectedRoute>
                  <Mobile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/operations" 
              element={
                <ProtectedRoute>
                  <Operations />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/finance" 
              element={
                <ProtectedRoute>
                  <Finance />
                </ProtectedRoute>
              } 
            />
            {/* Working module routes */}
            <Route 
              path="/registration" 
              element={
                <ProtectedRoute>
                  <Registration />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/checkin" 
              element={
                <ProtectedRoute>
                  <CheckIn />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/lab" 
              element={
                <ProtectedRoute>
                  <Laboratory />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/pharmacy" 
              element={
                <ProtectedRoute>
                  <Pharmacy />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/doctor" 
              element={
                <ProtectedRoute>
                  <Doctor />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/nurse" 
              element={
                <ProtectedRoute>
                  <Nurse />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/emergency" 
              element={
                <ProtectedRoute>
                  <Emergency />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/compliance" 
              element={
                <ProtectedRoute>
                  <Quality />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/inpatient" 
              element={
                <ProtectedRoute>
                  <Inpatient />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ward" 
              element={
                <ProtectedRoute>
                  <Ward />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/accounts" 
              element={
                <ProtectedRoute>
                  <Accounts />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/cashier" 
              element={
                <ProtectedRoute>
                  <Cashier />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/inventory" 
              element={
                <ProtectedRoute>
                  <Inventory />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/insurance" 
              element={
                <ProtectedRoute>
                  <Insurance />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/claims" 
              element={
                <ProtectedRoute>
                  <Claims />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/imaging" 
              element={
                <ProtectedRoute>
                  <Imaging />
                </ProtectedRoute>
              } 
            />
            {/* Working module routes continued */}
            <Route 
              path="/radiology" 
              element={
                <ProtectedRoute>
                  <Radiology />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/corporate" 
              element={
                <ProtectedRoute>
                  <Corporate />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/stores" 
              element={
                <ProtectedRoute>
                  <Stores />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/hr" 
              element={
                <ProtectedRoute>
                  <HR />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/emr" 
              element={
                <ProtectedRoute>
                  <EMR />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/theatre" 
              element={
                <ProtectedRoute>
                  <Theatre />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/obstetrics" 
              element={
                <ProtectedRoute>
                  <Obstetrics />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/patient-portal" 
              element={
                <ProtectedRoute>
                  <PatientPortal />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/telemedicine" 
              element={
                <ProtectedRoute>
                  <Telemedicine />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/feedback" 
              element={
                <ProtectedRoute>
                  <Feedback />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/audit" 
              element={
                <ProtectedRoute>
                  <Audit />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/backup" 
              element={
                <ProtectedRoute>
                  <Backup />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/api" 
              element={
                <ProtectedRoute>
                  <API />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;