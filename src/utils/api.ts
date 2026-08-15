import { DecisionAnalysis, User, AuthResponse } from '../types';

const TOKEN_KEY = 'tiebreaker_auth_token_v1';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Request Helper with Auth Token
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Auth API Calls
export async function apiRegister(email: string, password: string, name: string): Promise<AuthResponse> {
  const data = await request<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
  setStoredToken(data.token);
  return data;
}

export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  const data = await request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setStoredToken(data.token);
  return data;
}

export async function apiGetMe(): Promise<{ user: User }> {
  return request<{ user: User }>('/api/auth/me');
}

export async function apiLoginDemo(profile: 'user_a' | 'user_b' | 'guest'): Promise<AuthResponse> {
  const data = await request<AuthResponse>('/api/auth/demo', {
    method: 'POST',
    body: JSON.stringify({ profile }),
  });
  setStoredToken(data.token);
  return data;
}

export function apiLogout(): void {
  clearStoredToken();
}

// Decisions Library API Calls (Private to Authenticated User)
export async function apiGetDecisions(): Promise<DecisionAnalysis[]> {
  try {
    const res = await request<{ decisions: DecisionAnalysis[] } | DecisionAnalysis[]>('/api/decisions');
    if (Array.isArray(res)) {
      return res;
    }
    return res.decisions || [];
  } catch (err) {
    console.error('Failed to load user decisions:', err);
    return [];
  }
}

export async function apiGetDecisionById(id: string): Promise<DecisionAnalysis | null> {
  try {
    const res = await request<{ decision: DecisionAnalysis } | DecisionAnalysis>(`/api/decisions/${encodeURIComponent(id)}`);
    if ('decision' in res) {
      return res.decision;
    }
    return res as DecisionAnalysis;
  } catch (err) {
    console.error('Failed to load decision by id:', err);
    return null;
  }
}

export async function apiSaveDecision(decision: DecisionAnalysis): Promise<DecisionAnalysis> {
  const res = await request<{ decision: DecisionAnalysis } | DecisionAnalysis>('/api/decisions', {
    method: 'POST',
    body: JSON.stringify({ analysis: decision }),
  });
  if ('decision' in res) {
    return res.decision;
  }
  return res as DecisionAnalysis;
}

export async function apiDeleteDecision(id: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/api/decisions/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

// Independent AI Analysis Call with AbortController Support
export async function apiAnalyzeDecision(
  payload: {
    prompt: string;
    options?: string[];
    priorities?: string[];
    clarifyingAnswers?: Record<string, string>;
    category?: any;
    reversibility?: any;
    timeHorizon?: any;
    clarificationState?: any;
  },
  signal?: AbortSignal
): Promise<DecisionAnalysis> {
  return request<DecisionAnalysis>('/api/analyze', {
    method: 'POST',
    body: JSON.stringify(payload),
    signal,
  });
}

// Think Deeper Chat Call
export async function apiThinkDeeperChat(
  decisionContext: DecisionAnalysis,
  message: string
): Promise<{ reply: string }> {
  return request<{ reply: string }>('/api/think-deeper-chat', {
    method: 'POST',
    body: JSON.stringify({ decisionContext, message }),
  });
}
