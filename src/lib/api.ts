const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken() {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth endpoints
  async signUp(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    employeeId?: string;
  }) {
    const result = await this.request<{ user: any; token: string }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(result.token);
    return result;
  }

  async signIn(email: string, password: string) {
    const result = await this.request<{ user: any; token: string }>('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(result.token);
    return result;
  }

  async signOut() {
    await this.request('/api/auth/signout', { method: 'POST' });
    this.setToken(null);
  }

  async getMe() {
    return this.request<{ user: any }>('/api/auth/me');
  }

  // Patients endpoints
  async getPatients(params?: { status?: string; search?: string; limit?: number; offset?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    
    const query = searchParams.toString();
    return this.request<any[]>(`/api/patients${query ? `?${query}` : ''}`);
  }

  async getPatient(id: string) {
    return this.request<any>(`/api/patients/${id}`);
  }

  async createPatient(data: any) {
    return this.request<any>('/api/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePatient(id: string, data: any) {
    return this.request<any>(`/api/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePatient(id: string) {
    return this.request<{ success: boolean }>(`/api/patients/${id}`, {
      method: 'DELETE',
    });
  }

  // Appointments endpoints
  async getAppointments(params?: { 
    status?: string; 
    date?: string; 
    patient_id?: string;
    staff_id?: string;
    limit?: number; 
    offset?: number 
  }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.date) searchParams.set('date', params.date);
    if (params?.patient_id) searchParams.set('patient_id', params.patient_id);
    if (params?.staff_id) searchParams.set('staff_id', params.staff_id);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    
    const query = searchParams.toString();
    return this.request<any[]>(`/api/appointments${query ? `?${query}` : ''}`);
  }

  async getAppointment(id: string) {
    return this.request<any>(`/api/appointments/${id}`);
  }

  async createAppointment(data: any) {
    return this.request<any>('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAppointment(id: string, data: any) {
    return this.request<any>(`/api/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAppointment(id: string) {
    return this.request<{ success: boolean }>(`/api/appointments/${id}`, {
      method: 'DELETE',
    });
  }

  // Dashboard endpoints
  async getDashboardStats() {
    return this.request<any>('/api/dashboard/stats');
  }

  async getDashboardActivities() {
    return this.request<any[]>('/api/dashboard/activities');
  }

  async getDashboardAlerts() {
    return this.request<any[]>('/api/dashboard/alerts');
  }

  // Beds endpoints
  async getBeds(params?: { status?: string; department?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.department) searchParams.set('department', params.department);
    const query = searchParams.toString();
    return this.request<any[]>(`/api/beds${query ? `?${query}` : ''}`);
  }

  async getBed(id: string) {
    return this.request<any>(`/api/beds/${id}`);
  }

  async createBed(data: any) {
    return this.request<any>('/api/beds', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBed(id: string, data: any) {
    return this.request<any>(`/api/beds/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBed(id: string) {
    return this.request<{ success: boolean }>(`/api/beds/${id}`, {
      method: 'DELETE',
    });
  }

  // Alerts endpoints
  async getAlerts(params?: { status?: string; priority?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.priority) searchParams.set('priority', params.priority.toString());
    const query = searchParams.toString();
    return this.request<any[]>(`/api/alerts${query ? `?${query}` : ''}`);
  }

  async createAlert(data: any) {
    return this.request<any>('/api/alerts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async acknowledgeAlert(id: string) {
    return this.request<any>(`/api/alerts/${id}/acknowledge`, {
      method: 'PUT',
    });
  }

  async resolveAlert(id: string) {
    return this.request<any>(`/api/alerts/${id}/resolve`, {
      method: 'PUT',
    });
  }

  // Revenue endpoints
  async getRevenue(params?: { start_date?: string; end_date?: string; payment_status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.start_date) searchParams.set('start_date', params.start_date);
    if (params?.end_date) searchParams.set('end_date', params.end_date);
    if (params?.payment_status) searchParams.set('payment_status', params.payment_status);
    const query = searchParams.toString();
    return this.request<any[]>(`/api/revenue${query ? `?${query}` : ''}`);
  }

  async getRevenueSummary(params?: { start_date?: string; end_date?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.start_date) searchParams.set('start_date', params.start_date);
    if (params?.end_date) searchParams.set('end_date', params.end_date);
    const query = searchParams.toString();
    return this.request<any[]>(`/api/revenue/summary${query ? `?${query}` : ''}`);
  }

  async createRevenue(data: any) {
    return this.request<any>('/api/revenue', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRevenue(id: string, data: any) {
    return this.request<any>(`/api/revenue/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Activities endpoints
  async getActivities(params?: { activity_type?: string; entity_type?: string; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.activity_type) searchParams.set('activity_type', params.activity_type);
    if (params?.entity_type) searchParams.set('entity_type', params.entity_type);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    const query = searchParams.toString();
    return this.request<any[]>(`/api/activities${query ? `?${query}` : ''}`);
  }

  async createActivity(data: any) {
    return this.request<any>('/api/activities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Laboratory endpoints
  async getLabOrders(params?: { status?: string; patient_id?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.patient_id) searchParams.set('patient_id', params.patient_id);
    const query = searchParams.toString();
    return this.request<any[]>(`/api/laboratory/orders${query ? `?${query}` : ''}`);
  }

  async getLabOrder(id: string) {
    return this.request<any>(`/api/laboratory/orders/${id}`);
  }

  async createLabOrder(data: any) {
    return this.request<any>('/api/laboratory/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLabOrder(id: string, data: any) {
    return this.request<any>(`/api/laboratory/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getLabTests(params?: { order_id?: string; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.order_id) searchParams.set('order_id', params.order_id);
    if (params?.status) searchParams.set('status', params.status);
    const query = searchParams.toString();
    return this.request<any[]>(`/api/laboratory/tests${query ? `?${query}` : ''}`);
  }

  async updateLabTestResult(id: string, data: any) {
    return this.request<any>(`/api/laboratory/tests/${id}/result`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Pharmacy endpoints
  async getMedications(params?: { category?: string; search?: string; low_stock?: boolean }) {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.low_stock) searchParams.set('low_stock', 'true');
    const query = searchParams.toString();
    return this.request<any[]>(`/api/pharmacy/medications${query ? `?${query}` : ''}`);
  }

  async createMedication(data: any) {
    return this.request<any>('/api/pharmacy/medications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMedication(id: string, data: any) {
    return this.request<any>(`/api/pharmacy/medications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getPrescriptions(params?: { patient_id?: string; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.patient_id) searchParams.set('patient_id', params.patient_id);
    if (params?.status) searchParams.set('status', params.status);
    const query = searchParams.toString();
    return this.request<any[]>(`/api/pharmacy/prescriptions${query ? `?${query}` : ''}`);
  }

  async getPrescription(id: string) {
    return this.request<any>(`/api/pharmacy/prescriptions/${id}`);
  }

  async createPrescription(data: any) {
    return this.request<any>('/api/pharmacy/prescriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async dispensePrescription(id: string, data: any) {
    return this.request<any>(`/api/pharmacy/prescriptions/${id}/dispense`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // EMR endpoints
  async getMedicalRecords(params?: { patient_id?: string; status?: string; encounter_type?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.patient_id) searchParams.set('patient_id', params.patient_id);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.encounter_type) searchParams.set('encounter_type', params.encounter_type);
    const query = searchParams.toString();
    return this.request<any[]>(`/api/emr/records${query ? `?${query}` : ''}`);
  }

  async getMedicalRecord(id: string) {
    return this.request<any>(`/api/emr/records/${id}`);
  }

  async createMedicalRecord(data: any) {
    return this.request<any>('/api/emr/records', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMedicalRecord(id: string, data: any) {
    return this.request<any>(`/api/emr/records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getVitals(params?: { patient_id?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.patient_id) searchParams.set('patient_id', params.patient_id);
    const query = searchParams.toString();
    return this.request<any[]>(`/api/emr/vitals${query ? `?${query}` : ''}`);
  }

  async createVitals(data: any) {
    return this.request<any>('/api/emr/vitals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // HR endpoints
  async getStaff(params?: { department?: string; role?: string; search?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.department) searchParams.set('department', params.department);
    if (params?.role) searchParams.set('role', params.role);
    if (params?.search) searchParams.set('search', params.search);
    const query = searchParams.toString();
    return this.request<any[]>(`/api/hr/staff${query ? `?${query}` : ''}`);
  }

  async getStaffMember(id: string) {
    return this.request<any>(`/api/hr/staff/${id}`);
  }

  async updateStaffMember(id: string, data: any) {
    return this.request<any>(`/api/hr/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getDepartments() {
    return this.request<any[]>('/api/hr/departments');
  }

  async createDepartment(data: any) {
    return this.request<any>('/api/hr/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSchedules(params?: { user_id?: string; department_id?: string; start_date?: string; end_date?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.user_id) searchParams.set('user_id', params.user_id);
    if (params?.department_id) searchParams.set('department_id', params.department_id);
    if (params?.start_date) searchParams.set('start_date', params.start_date);
    if (params?.end_date) searchParams.set('end_date', params.end_date);
    const query = searchParams.toString();
    return this.request<any[]>(`/api/hr/schedules${query ? `?${query}` : ''}`);
  }

  async createSchedule(data: any) {
    return this.request<any>('/api/hr/schedules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getLeaveRequests(params?: { user_id?: string; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.user_id) searchParams.set('user_id', params.user_id);
    if (params?.status) searchParams.set('status', params.status);
    const query = searchParams.toString();
    return this.request<any[]>(`/api/hr/leave-requests${query ? `?${query}` : ''}`);
  }

  async createLeaveRequest(data: any) {
    return this.request<any>('/api/hr/leave-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approveLeaveRequest(id: string) {
    return this.request<any>(`/api/hr/leave-requests/${id}/approve`, { method: 'PUT' });
  }

  async rejectLeaveRequest(id: string) {
    return this.request<any>(`/api/hr/leave-requests/${id}/reject`, { method: 'PUT' });
  }

  // Inventory endpoints
  async getInventoryItems(params?: { category?: string; search?: string; low_stock?: boolean }) {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.low_stock) searchParams.set('low_stock', 'true');
    const query = searchParams.toString();
    return this.request<any[]>(`/api/inventory/items${query ? `?${query}` : ''}`);
  }

  async getInventoryItem(id: string) {
    return this.request<any>(`/api/inventory/items/${id}`);
  }

  async createInventoryItem(data: any) {
    return this.request<any>('/api/inventory/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInventoryItem(id: string, data: any) {
    return this.request<any>(`/api/inventory/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getInventoryTransactions(params?: { item_id?: string; transaction_type?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.item_id) searchParams.set('item_id', params.item_id);
    if (params?.transaction_type) searchParams.set('transaction_type', params.transaction_type);
    const query = searchParams.toString();
    return this.request<any[]>(`/api/inventory/transactions${query ? `?${query}` : ''}`);
  }

  async createInventoryTransaction(data: any) {
    return this.request<any>('/api/inventory/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPurchaseOrders(params?: { status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    const query = searchParams.toString();
    return this.request<any[]>(`/api/inventory/purchase-orders${query ? `?${query}` : ''}`);
  }

  async getPurchaseOrder(id: string) {
    return this.request<any>(`/api/inventory/purchase-orders/${id}`);
  }

  async createPurchaseOrder(data: any) {
    return this.request<any>('/api/inventory/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePurchaseOrderStatus(id: string, status: string) {
    return this.request<any>(`/api/inventory/purchase-orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Queue Management endpoints
  async getQueue(params?: { department?: string; status?: string; date?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.department) searchParams.set('department', params.department);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.date) searchParams.set('date', params.date);
    const query = searchParams.toString();
    return this.request<any[]>(`/api/queue${query ? `?${query}` : ''}`);
  }

  async getQueueStats() {
    return this.request<any>('/api/queue/stats');
  }

  async getNowServing(department?: string) {
    const query = department ? `?department=${department}` : '';
    return this.request<any[]>(`/api/queue/now-serving${query}`);
  }

  async addToQueue(data: { patient_id: string; department: string; appointment_id?: string; service_type?: string; priority?: number; notes?: string }) {
    return this.request<any>('/api/queue', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async callNextPatient(department: string, room_number?: string) {
    return this.request<any>('/api/queue/call-next', {
      method: 'POST',
      body: JSON.stringify({ department, room_number }),
    });
  }

  async updateQueueStatus(id: string, status: string, room_number?: string) {
    return this.request<any>(`/api/queue/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, room_number }),
    });
  }

  async updateQueueStage(id: string, stage: string, room_number?: string) {
    return this.request<any>(`/api/queue/${id}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ stage, room_number }),
    });
  }

  async removeFromQueue(id: string) {
    return this.request<any>(`/api/queue/${id}`, { method: 'DELETE' });
  }

  // Triage endpoints
  async getTriageAssessments(params?: { patient_id?: string; date?: string; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.patient_id) searchParams.set('patient_id', params.patient_id);
    if (params?.date) searchParams.set('date', params.date);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    const query = searchParams.toString();
    return this.request<any[]>(`/api/triage${query ? `?${query}` : ''}`);
  }

  async getTriageAssessment(id: string) {
    return this.request<any>(`/api/triage/${id}`);
  }

  async createTriageAssessment(data: any) {
    return this.request<any>('/api/triage', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTriageAssessment(id: string, data: any) {
    return this.request<any>(`/api/triage/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Invoice endpoints
  async getInvoices(params?: { patient_id?: string; status?: string; from_date?: string; to_date?: string; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.patient_id) searchParams.set('patient_id', params.patient_id);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.from_date) searchParams.set('from_date', params.from_date);
    if (params?.to_date) searchParams.set('to_date', params.to_date);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    const query = searchParams.toString();
    return this.request<any[]>(`/api/invoices${query ? `?${query}` : ''}`);
  }

  async getInvoiceStats(params?: { from_date?: string; to_date?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.from_date) searchParams.set('from_date', params.from_date);
    if (params?.to_date) searchParams.set('to_date', params.to_date);
    const query = searchParams.toString();
    return this.request<any>(`/api/invoices/stats${query ? `?${query}` : ''}`);
  }

  async getInvoice(id: string) {
    return this.request<any>(`/api/invoices/${id}`);
  }

  async createInvoice(data: any) {
    return this.request<any>('/api/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async recordPayment(invoiceId: string, data: { amount: number; payment_method: string; reference_number?: string; notes?: string }) {
    return this.request<any>(`/api/invoices/${invoiceId}/payments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInvoiceStatus(id: string, status: string) {
    return this.request<any>(`/api/invoices/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async deleteInvoice(id: string) {
    return this.request<any>(`/api/invoices/${id}`, { method: 'DELETE' });
  }

  // ICD-10 endpoints
  async searchICD10(params?: { q?: string; category?: string; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.set('q', params.q);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    const query = searchParams.toString();
    return this.request<any[]>(`/api/icd10/search${query ? `?${query}` : ''}`);
  }

  async getICD10Categories() {
    return this.request<string[]>('/api/icd10/categories');
  }

  async getNotifiableDiseases() {
    return this.request<any[]>('/api/icd10/notifiable');
  }

  async checkNotifiable(code: string) {
    return this.request<any>(`/api/icd10/check-notifiable/${code}`);
  }

  async getDiagnosisStatistics(params?: { start_date?: string; end_date?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.start_date) searchParams.set('start_date', params.start_date);
    if (params?.end_date) searchParams.set('end_date', params.end_date);
    const query = searchParams.toString();
    return this.request<any[]>(`/api/icd10/statistics${query ? `?${query}` : ''}`);
  }

  // Ghana Locations endpoints
  async getRegions() {
    return this.request<any[]>('/api/locations/regions');
  }

  async getConstituencies(regionId?: number, regionName?: string) {
    const searchParams = new URLSearchParams();
    if (regionId) searchParams.set('region_id', regionId.toString());
    if (regionName) searchParams.set('region_name', regionName);
    const query = searchParams.toString();
    return this.request<any[]>(`/api/locations/constituencies${query ? `?${query}` : ''}`);
  }

  async getDistricts(params?: { constituency_id?: number; region_id?: number; region_name?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.constituency_id) searchParams.set('constituency_id', params.constituency_id.toString());
    if (params?.region_id) searchParams.set('region_id', params.region_id.toString());
    if (params?.region_name) searchParams.set('region_name', params.region_name);
    const query = searchParams.toString();
    return this.request<any[]>(`/api/locations/districts${query ? `?${query}` : ''}`);
  }

  // File upload for patient photo
  async uploadPatientPhoto(patientId: string, file: File) {
    const formData = new FormData();
    formData.append('photo', file);
    
    const response = await fetch(`${API_URL}/api/patients/${patientId}/photo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Upload failed');
    }
    
    return response.json();
  }
}

export const api = new ApiClient();
