// Supabase client stub - redirects to new Neon PostgreSQL API
// Components that import this will get mock responses

import { api } from '@/lib/api';

// Mock Supabase-like interface for backward compatibility
const createMockQuery = (tableName: string) => {
  let filters: Record<string, any> = {};
  let selectFields = '*';
  let orderField = 'created_at';
  let orderAsc = false;
  let limitCount = 50;

  const queryBuilder = {
    select: (fields: string = '*', options?: any) => {
      selectFields = fields;
      return queryBuilder;
    },
    eq: (field: string, value: any) => {
      filters[field] = value;
      return queryBuilder;
    },
    neq: (field: string, value: any) => {
      filters[`${field}_neq`] = value;
      return queryBuilder;
    },
    match: (obj: Record<string, any>) => {
      Object.assign(filters, obj);
      return queryBuilder;
    },
    or: (condition: string) => {
      return queryBuilder;
    },
    order: (field: string, options?: { ascending?: boolean }) => {
      orderField = field;
      orderAsc = options?.ascending ?? false;
      return queryBuilder;
    },
    limit: (count: number) => {
      limitCount = count;
      return queryBuilder;
    },
    single: async () => {
      const result = await queryBuilder.execute();
      return { data: result.data?.[0] || null, error: result.error };
    },
    execute: async () => {
      try {
        let data: any[] = [];
        
        switch (tableName) {
          case 'patients':
            data = await api.getPatients({ limit: limitCount });
            break;
          case 'appointments':
            data = await api.getAppointments({ limit: limitCount });
            break;
          case 'beds':
            data = await api.getBeds();
            break;
          case 'alerts':
            data = await api.getAlerts({ status: filters.status });
            break;
          case 'activities':
            data = await api.getActivities({ limit: limitCount });
            break;
          case 'revenue':
            data = await api.getRevenue();
            break;
          case 'lab_orders':
            data = await api.getLabOrders({ patient_id: filters.patient_id, status: filters.status });
            break;
          case 'lab_tests':
            data = await api.getLabTests({ order_id: filters.order_id, status: filters.status });
            break;
          case 'medications':
            data = await api.getMedications({ category: filters.category, search: filters.search });
            break;
          case 'prescriptions':
            data = await api.getPrescriptions({ patient_id: filters.patient_id, status: filters.status });
            break;
          case 'medical_records':
            data = await api.getMedicalRecords({ patient_id: filters.patient_id, status: filters.status });
            break;
          case 'vitals':
            data = await api.getVitals({ patient_id: filters.patient_id });
            break;
          case 'users':
          case 'profiles':
            data = await api.getStaff({ department: filters.department });
            break;
          case 'departments':
            data = await api.getDepartments();
            break;
          case 'staff_schedules':
            data = await api.getSchedules({ user_id: filters.user_id });
            break;
          case 'leave_requests':
            data = await api.getLeaveRequests({ user_id: filters.user_id, status: filters.status });
            break;
          case 'inventory_items':
            data = await api.getInventoryItems({ category: filters.category });
            break;
          case 'inventory_transactions':
            data = await api.getInventoryTransactions({ item_id: filters.item_id });
            break;
          case 'purchase_orders':
            data = await api.getPurchaseOrders({ status: filters.status });
            break;
          default:
            data = [];
        }
        
        return { data, error: null, count: data.length };
      } catch (error: any) {
        return { data: null, error: { message: error.message }, count: 0 };
      }
    },
    then: async (resolve: any) => {
      const result = await queryBuilder.execute();
      return resolve(result);
    }
  };

  return queryBuilder;
};

const createMockInsert = (tableName: string) => {
  let insertData: any = null;

  return {
    insert: (data: any) => {
      insertData = data;
      return {
        select: () => ({
          single: async () => {
            try {
              let result: any = null;
              switch (tableName) {
                case 'patients':
                  result = await api.createPatient(insertData);
                  break;
                case 'appointments':
                  result = await api.createAppointment(insertData);
                  break;
                case 'alerts':
                  result = await api.createAlert(insertData);
                  break;
                case 'lab_orders':
                  result = await api.createLabOrder(insertData);
                  break;
                case 'medications':
                  result = await api.createMedication(insertData);
                  break;
                case 'prescriptions':
                  result = await api.createPrescription(insertData);
                  break;
                case 'medical_records':
                  result = await api.createMedicalRecord(insertData);
                  break;
                case 'vitals':
                  result = await api.createVitals(insertData);
                  break;
                case 'departments':
                  result = await api.createDepartment(insertData);
                  break;
                case 'staff_schedules':
                  result = await api.createSchedule(insertData);
                  break;
                case 'leave_requests':
                  result = await api.createLeaveRequest(insertData);
                  break;
                case 'inventory_items':
                  result = await api.createInventoryItem(insertData);
                  break;
                case 'inventory_transactions':
                  result = await api.createInventoryTransaction(insertData);
                  break;
                case 'purchase_orders':
                  result = await api.createPurchaseOrder(insertData);
                  break;
                default:
                  result = insertData;
              }
              return { data: result, error: null };
            } catch (error: any) {
              return { data: null, error: { message: error.message } };
            }
          }
        })
      };
    }
  };
};

export const supabase = {
  from: (tableName: string) => ({
    ...createMockQuery(tableName),
    ...createMockInsert(tableName),
    update: (data: any) => ({
      eq: (field: string, value: any) => ({
        select: () => ({
          single: async () => {
            try {
              let result: any = null;
              switch (tableName) {
                case 'patients':
                  result = await api.updatePatient(value, data);
                  break;
                case 'appointments':
                  result = await api.updateAppointment(value, data);
                  break;
                default:
                  result = data;
              }
              return { data: result, error: null };
            } catch (error: any) {
              return { data: null, error: { message: error.message } };
            }
          }
        })
      })
    }),
    delete: () => ({
      eq: async (field: string, value: any) => {
        try {
          switch (tableName) {
            case 'patients':
              await api.deletePatient(value);
              break;
            case 'appointments':
              await api.deleteAppointment(value);
              break;
          }
          return { error: null };
        } catch (error: any) {
          return { error: { message: error.message } };
        }
      }
    })
  }),
  auth: {
    getSession: async () => {
      const token = api.getToken();
      if (token) {
        try {
          const { user } = await api.getMe();
          return { data: { session: { user, access_token: token } }, error: null };
        } catch {
          return { data: { session: null }, error: null };
        }
      }
      return { data: { session: null }, error: null };
    },
    onAuthStateChange: (callback: any) => {
      // Return a mock subscription
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      try {
        const result = await api.signIn(email, password);
        return { data: { user: result.user, session: { access_token: result.token } }, error: null };
      } catch (error: any) {
        return { data: { user: null, session: null }, error: { message: error.message } };
      }
    },
    signUp: async ({ email, password, options }: any) => {
      try {
        const result = await api.signUp({
          email,
          password,
          firstName: options?.data?.first_name || '',
          lastName: options?.data?.last_name || ''
        });
        return { data: { user: result.user }, error: null };
      } catch (error: any) {
        return { data: { user: null }, error: { message: error.message } };
      }
    },
    signOut: async () => {
      await api.signOut();
      return { error: null };
    }
  },
  channel: (name: string) => ({
    on: (event: string, config: any, callback: any) => ({
      subscribe: () => ({ unsubscribe: () => {} })
    }),
    subscribe: () => ({ unsubscribe: () => {} })
  }),
  removeChannel: (channel: any) => {},
  rpc: async (functionName: string, params?: any) => {
    // Mock RPC calls
    return { data: null, error: null };
  }
};