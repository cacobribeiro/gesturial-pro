import { CategoryInput, InvestmentAssetInput, TransactionInput } from '@gesturial/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export type ApiError = { error: { code: string; message: string; details?: unknown } };

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as ApiError | null;
    throw new Error(data?.error?.message || 'Erro de requisição');
  }
  return res.json();
}

export const api = {
  register: (body: { username: string; password: string }) =>
    request<{ token: string }>('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { username: string; password: string }) =>
    request<{ token: string }>('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: (token: string) => request<{ id: string; username: string }>('/api/auth/me', {}, token),
  listCategories: (token: string) => request('/api/categories', {}, token),
  createCategory: (token: string, body: CategoryInput) =>
    request('/api/categories', { method: 'POST', body: JSON.stringify(body) }, token),
  updateCategory: (token: string, id: string, body: CategoryInput) =>
    request(`/api/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) }, token),
  deleteCategory: (token: string, id: string) =>
    request(`/api/categories/${id}`, { method: 'DELETE' }, token),
  listTransactions: (token: string, query: string) => request(`/api/transactions${query}`, {}, token),
  createTransaction: (token: string, body: TransactionInput) =>
    request('/api/transactions', { method: 'POST', body: JSON.stringify(body) }, token),
  updateTransaction: (token: string, id: string, body: TransactionInput) =>
    request(`/api/transactions/${id}`, { method: 'PUT', body: JSON.stringify(body) }, token),
  deleteTransaction: (token: string, id: string) =>
    request(`/api/transactions/${id}`, { method: 'DELETE' }, token),
  summary: (token: string, month: string) => request(`/api/summary?month=${month}`, {}, token),
  listAssets: (token: string) => request('/api/investments/assets', {}, token),
  createAsset: (token: string, body: InvestmentAssetInput) =>
    request('/api/investments/assets', { method: 'POST', body: JSON.stringify(body) }, token),
  updateAsset: (token: string, id: string, body: InvestmentAssetInput) =>
    request(`/api/investments/assets/${id}`, { method: 'PUT', body: JSON.stringify(body) }, token),
  deleteAsset: (token: string, id: string) =>
    request(`/api/investments/assets/${id}`, { method: 'DELETE' }, token),
};
