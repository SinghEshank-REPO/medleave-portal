const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper to get auth headers
const getHeaders = (isMultipart = false) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = {};
  
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// API handler helper
async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API request failed with status ${response.status}`);
  }
  return response.json();
}

export const api = {
  // Auth endpoints
  async login(credentials: { email: string; password?: string }) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  },

  async register(formData: any) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  },

  async me() {
    const res = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  logout() {
    localStorage.removeItem('token');
  },

  // Leave endpoints
  async applyLeave(formData: FormData) {
    const res = await fetch(`${API_URL}/leaves`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    });
    return handleResponse(res);
  },

  async getLeaves() {
    const res = await fetch(`${API_URL}/leaves`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getLeaveDetails(id: string) {
    const res = await fetch(`${API_URL}/leaves/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async reviewLeave(id: string, action: 'APPROVE' | 'REJECT' | 'CLARIFY', remarks: string) {
    const res = await fetch(`${API_URL}/leaves/${id}/review`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ action, remarks })
    });
    return handleResponse(res);
  },

  async addComment(leaveId: string, content: string) {
    const res = await fetch(`${API_URL}/leaves/${leaveId}/comment`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ content })
    });
    return handleResponse(res);
  },

  async getReport(id: string) {
    const res = await fetch(`${API_URL}/leaves/${id}/report`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Condonation endpoints
  async getPendingCondonations() {
    const res = await fetch(`${API_URL}/condonation/pending`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async condoneClass(id: string, action: 'CONDONE' | 'REJECT') {
    const res = await fetch(`${API_URL}/condonation/${id}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ action })
    });
    return handleResponse(res);
  },

  async getAttendanceStats() {
    const res = await fetch(`${API_URL}/condonation/stats`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Admin endpoints
  async getAuditLogs() {
    const res = await fetch(`${API_URL}/admin/audit`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getAnalytics() {
    const res = await fetch(`${API_URL}/admin/analytics`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getUsers() {
    const res = await fetch(`${API_URL}/admin/users`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getRepeatPatterns() {
    const res = await fetch(`${API_URL}/admin/repeat-patterns`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async triggerEscalationCheck() {
    const res = await fetch(`${API_URL}/admin/escalate-check`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // General utils
  async getDepartments() {
    const res = await fetch(`${API_URL}/departments`, {
      method: 'GET'
    });
    return handleResponse(res);
  },

  async getNotifications() {
    const res = await fetch(`${API_URL}/notifications`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async markNotificationRead(id: string) {
    const res = await fetch(`${API_URL}/notifications/${id}/read`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(res);
  }
};
