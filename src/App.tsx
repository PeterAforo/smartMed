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
            {/* Placeholder routes for all SmartMed modules */}
            {[
              'registration', 'checkin', 'inpatient', 'ward', 'doctor', 'nurse',
              'lab', 'inventory', 'accounts', 'cashier', 'insurance', 'claims',
              'pharmacy', 'imaging', 'radiology', 'corporate', 'stores', 'hr',
              'emr', 'theatre', 'emergency', 'obstetrics',
              'patient-portal', 'telemedicine', 'feedback', 'compliance',
              'audit', 'backup', 'api'
            ].map(module => (
              <Route 
                key={module}
                path={`/${module}`} 
                element={
                  <ProtectedRoute>
                    <div className="min-h-screen flex items-center justify-center bg-background">
                      <div className="text-center">
                        <h1 className="text-3xl font-bold mb-4 text-primary capitalize">
                          {module.replace('-', ' ')} Module
                        </h1>
                        <p className="text-muted-foreground">
                          This module is under development and will be available soon.
                        </p>
                      </div>
                    </div>
                  </ProtectedRoute>
                } 
              />
            ))}
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;