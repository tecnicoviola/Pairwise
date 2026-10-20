import {
  Customer,
  MatchmakerUser,
  Note,
  Match,
  MatchRecommendation,
  JourneyStage,
  VerificationStatus,
} from '../types';

const API_BASE = `${(import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? ''}/api`;

function getToken(): string | null {
  return localStorage.getItem('tdc_token');
}

export function setToken(token: string) {
  localStorage.setItem('tdc_token', token);
}

export function clearToken() {
  localStorage.removeItem('tdc_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401 && token && !endpoint.startsWith('/auth/login')) {
    // Expired or invalid session: clear it and return to login
    clearToken();
    if (window.location.pathname !== '/login') window.location.assign('/login');
  }

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  auth: {
    login: async (identifier: string, password: string) => {
      const res = await request<{ message: string; token: string; user: MatchmakerUser }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      });
      setToken(res.token);
      return res;
    },
    register: async (data: { name: string; email: string; username: string; password: string }) => {
      const res = await request<{ message: string; token: string; user: MatchmakerUser }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      setToken(res.token);
      return res;
    },
    getMe: async () => {
      return request<{ user: MatchmakerUser }>('/auth/me');
    },
    logout: () => {
      clearToken();
    },
  },

  customers: {
    list: async (params: {
      search?: string;
      journeyStage?: string;
      verificationStatus?: string;
      city?: string;
      gender?: string;
      sortBy?: string;
      sortOrder?: string;
      page?: number;
      limit?: number;
    } = {}) => {
      const query = new URLSearchParams();
      if (params.search) query.set('search', params.search);
      if (params.journeyStage && params.journeyStage !== 'ALL') query.set('journeyStage', params.journeyStage);
      if (params.verificationStatus && params.verificationStatus !== 'ALL') query.set('verificationStatus', params.verificationStatus);
      if (params.city && params.city !== 'ALL') query.set('city', params.city);
      if (params.gender && params.gender !== 'ALL') query.set('gender', params.gender);
      if (params.sortBy) query.set('sortBy', params.sortBy);
      if (params.sortOrder) query.set('sortOrder', params.sortOrder);
      if (params.page) query.set('page', params.page.toString());
      if (params.limit) query.set('limit', params.limit.toString());

      const qs = query.toString();
      return request<{
        data: Customer[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
        stats: {
          totalCustomers: number;
          verifiedProfiles: number;
          readyForMatches: number;
          pendingFollowUps: number;
        };
      }>(`/customers${qs ? `?${qs}` : ''}`);
    },

    getById: async (id: string) => {
      return request<{ data: Customer }>(`/customers/${id}`);
    },

    update: async (id: string, updates: {
      journeyStage?: JourneyStage;
      verificationStatus?: VerificationStatus;
      lastContactDate?: string;
    }) => {
      return request<{ data: Customer }>(`/customers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },
  },

  notes: {
    list: async (customerId: string) => {
      return request<{ data: Note[] }>(`/customers/${customerId}/notes`);
    },
    create: async (customerId: string, content: string, category: string = 'GENERAL') => {
      return request<{ data: Note; message: string }>(`/customers/${customerId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ content, category }),
      });
    },
  },

  matches: {
    listForCustomer: async (customerId: string) => {
      return request<{ data: Match[] }>(`/customers/${customerId}/matches`);
    },
    generate: async (customerId: string, options: { limit?: number; requireVerifiedOnly?: boolean } = {}) => {
      return request<{ data: MatchRecommendation[]; message: string }>(`/customers/${customerId}/matches/generate`, {
        method: 'POST',
        body: JSON.stringify(options),
      });
    },
    getById: async (matchId: string) => {
      return request<{ data: Match }>(`/matches/${matchId}`);
    },
    getDraft: async (matchId: string) => {
      return request<{ data: { source: 'ai' | 'fallback'; draftMessage: string; matchExplanation: string } }>(
        `/matches/${matchId}/draft`,
        { method: 'POST' }
      );
    },
    send: async (matchId: string, introductionMessage: string) => {
      return request<{ data: Match; message: string }>(`/matches/${matchId}/send`, {
        method: 'POST',
        body: JSON.stringify({ introductionMessage }),
      });
    },
  },
};
