/**
 * services/api.ts
 * Centralized API client with JWT interception and error normalization.
 */

const API_BASE = 'http://localhost:8000';

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('aether_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        // fallback
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // ── Auth ──
  async login(email: string, password: string) {
    return this.request<any>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: { email: string; password: string; full_name: string; student_id_number?: string; school?: string }) {
    return this.request<any>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe() {
    return this.request<any>('/api/auth/me');
  }

  // ── Student Portal ──
  async getStudentOverview() {
    return this.request<any>('/api/students/overview');
  }

  async getStudentProfile() {
    return this.request<any>('/api/students/profile');
  }

  async updateStudentProfile(data: any) {
    return this.request<any>('/api/students/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getGoals() {
    return this.request<any[]>('/api/students/goals');
  }

  async createGoal(data: { title: string; category: string; target_hours: number; due_date?: string }) {
    return this.request<any>('/api/students/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGoal(goalId: number, data: any) {
    return this.request<any>(`/api/students/goals/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteGoal(goalId: number) {
    return this.request<any>(`/api/students/goals/${goalId}`, {
      method: 'DELETE',
    });
  }

  // ── Predictions ──
  async createPrediction(data: any) {
    return this.request<any>('/api/predictions/predict', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPredictionHistory() {
    return this.request<any[]>('/api/predictions/history');
  }

  async downloadPredictionPdf(predictionId: number): Promise<Blob> {
    const token = this.getToken();
    const res = await fetch(`${API_BASE}/api/predictions/${predictionId}/pdf`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to download PDF' }));
      throw new Error(err.detail || 'Download failed');
    }
    return res.blob();
  }

  // ── Admin Portal ──
  async getAdminOverview() {
    return this.request<any>('/api/admin/overview');
  }

  async getAdminStudents(page = 1, pageSize = 10, search = '') {
    const q = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
    if (search) q.append('search', search);
    return this.request<any>(`/api/admin/students?${q.toString()}`);
  }

  async toggleStudentStatus(studentId: number) {
    return this.request<any>(`/api/admin/students/${studentId}/status`, {
      method: 'PUT',
    });
  }

  async getStudentPredictionsForAdmin(studentId: number) {
    return this.request<any[]>(`/api/admin/students/${studentId}/predictions`);
  }

  async getAdminAnalytics() {
    return this.request<any>('/api/admin/analytics');
  }

  async exportStudentsCsv(): Promise<Blob> {
    const token = this.getToken();
    const res = await fetch(`${API_BASE}/api/admin/analytics/export-csv`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Failed to export CSV');
    return res.blob();
  }

  async getModelBenchmarks() {
    return this.request<any>('/api/admin/models');
  }

  async getAuditLogs(limit = 50) {
    return this.request<any[]>(`/api/admin/audit?limit=${limit}`);
  }
}

export const api = new ApiService();
