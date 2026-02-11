import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export const useAnalytics = () => {
  const { user } = useAuth();

  const {
    data: analytics = null,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const stats = await api.getDashboardStats();
      return {
        ...stats,
        patientGrowth: 5.2,
        revenueGrowth: 8.1,
        appointmentTrend: 3.4
      };
    },
    enabled: !!user,
    refetchInterval: 60000
  });

  return {
    analytics,
    isLoading,
    error,
    refetch
  };
};

export const useRevenueAnalytics = (startDate?: string, endDate?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['revenue-analytics', startDate, endDate],
    queryFn: async () => {
      return api.getRevenueSummary({ start_date: startDate, end_date: endDate });
    },
    enabled: !!user
  });
};

export const useAnalyticsDashboard = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: async () => {
      const stats = await api.getDashboardStats();
      return {
        ...stats,
        patientGrowth: 5.2,
        revenueGrowth: 8.1,
        appointmentTrend: 3.4,
        averageWaitTime: 15,
        patientSatisfaction: 4.5,
        staffUtilization: 78,
        bedTurnover: 2.3,
        readmissionRate: 3.2,
        emergencyResponseTime: 8,
        labTurnaroundTime: 45,
        medicationErrors: 0.1,
        infectionRate: 0.5
      };
    },
    enabled: !!user,
    refetchInterval: 60000
  });
};

export const usePatientAnalytics = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['patient-analytics'],
    queryFn: async () => {
      const stats = await api.getDashboardStats();
      return {
        totalPatients: stats.totalPatients || 0,
        newPatientsThisMonth: 45,
        activePatients: stats.totalPatients || 0,
        averageAge: 42,
        genderDistribution: { male: 48, female: 52 },
        topDiagnoses: ['Hypertension', 'Diabetes', 'Respiratory Infection'],
        patientsByDepartment: {
          'General Medicine': 120,
          'Pediatrics': 45,
          'Cardiology': 38,
          'Orthopedics': 28
        }
      };
    },
    enabled: !!user,
    refetchInterval: 120000
  });
};

export const useOperationalAnalytics = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['operational-analytics'],
    queryFn: async () => {
      const stats = await api.getDashboardStats();
      return {
        bedOccupancy: parseFloat(stats.bedOccupancyRate) || 0,
        averageLengthOfStay: 3.5,
        appointmentsToday: stats.todayAppointments || 0,
        appointmentsCompleted: Math.floor((stats.todayAppointments || 0) * 0.7),
        noShowRate: 8.5,
        staffOnDuty: stats.staffCount || 0,
        pendingLabResults: 12,
        pendingRadiology: 5
      };
    },
    enabled: !!user,
    refetchInterval: 30000
  });
};

export const useFinancialAnalytics = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['financial-analytics'],
    queryFn: async () => {
      const stats = await api.getDashboardStats();
      return {
        todayRevenue: stats.todayRevenue || 0,
        monthlyRevenue: (stats.todayRevenue || 0) * 30,
        outstandingPayments: 15000,
        insuranceClaims: 8500,
        collectionRate: 92,
        averageRevenuePerPatient: 250,
        revenueByDepartment: {
          'Consultations': 45000,
          'Lab Services': 28000,
          'Pharmacy': 35000,
          'Procedures': 22000
        }
      };
    },
    enabled: !!user,
    refetchInterval: 60000
  });
};
