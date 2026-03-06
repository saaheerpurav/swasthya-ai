import type {
  Alert,
  Analytics,
  CreateAlertInput,
  CreateDriveInput,
  CreateOutbreakInput,
  Outbreak,
  Paginated,
  Stats,
  UserDetail,
  UserSummary,
  VaccinationDrive,
  QuerySummary,
} from '../types'

const apiFetch = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null
  const adminKey = typeof window !== 'undefined' ? localStorage.getItem('admin_key') : null

  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(adminKey ? { 'X-Admin-Key': adminKey } : {}),
      ...options?.headers,
    },
  })

  const body = await res.json()
  if (!body.ok) {
    throw new Error(body.error?.message ?? 'API Error')
  }
  return body.data as T
}

export async function bootstrapSession() {
  const existing = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null
  if (existing) return
  const data = await apiFetch<{ token: string }>('/auth/session', {
    method: 'POST',
    body: JSON.stringify({ channel: 'web' }),
  })
  if (typeof window !== 'undefined') {
    localStorage.setItem('session_token', data.token)
  }
}

// Stats & Analytics
export const getAdminStats = () => apiFetch<Stats>('/admin/stats')
export const getAdminAnalytics = (period = '30d') =>
  apiFetch<Analytics>(`/admin/analytics?period=${period}`)

// Users
export const listUsers = (params: URLSearchParams) =>
  apiFetch<Paginated<UserSummary>>(`/admin/users?${params.toString()}`)
export const getUserDetail = (userId: string) =>
  apiFetch<UserDetail>(`/admin/users/${userId}`)

// Queries
export const listQueries = (params: URLSearchParams) =>
  apiFetch<Paginated<QuerySummary>>(`/admin/queries?${params.toString()}`)

// Alerts
export const listAlerts = (params?: URLSearchParams) =>
  apiFetch<{ alerts: Alert[] }>(`/admin/alerts${params ? `?${params.toString()}` : ''}`)
export const createAlert = (data: CreateAlertInput) =>
  apiFetch<{ alert: Alert; notificationsSent: number }>('/admin/alerts', {
    method: 'POST',
    body: JSON.stringify(data),
  })
export const updateAlert = (id: string, data: Partial<CreateAlertInput>) =>
  apiFetch<{ alert: Alert }>(`/admin/alerts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
export const deleteAlert = (id: string) =>
  apiFetch<void>(`/admin/alerts/${id}`, { method: 'DELETE' })

// Public alerts (no admin key)
export const getPublicAlerts = (regionCode?: string) =>
  apiFetch<{ alerts: Alert[] }>(
    `/alerts${regionCode ? `?regionCode=${encodeURIComponent(regionCode)}` : ''}`,
  )

// Outbreaks
export const listOutbreaks = (params?: URLSearchParams) =>
  apiFetch<Paginated<Outbreak>>(`/admin/outbreaks${params ? `?${params.toString()}` : ''}`)
export const createOutbreak = (data: CreateOutbreakInput) =>
  apiFetch<Outbreak>('/admin/outbreaks', { method: 'POST', body: JSON.stringify(data) })
export const updateOutbreak = (id: string, data: Partial<CreateOutbreakInput>) =>
  apiFetch<Outbreak>(`/admin/outbreaks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

// Vaccination drives
export const listVaccinationDrives = (params?: URLSearchParams) =>
  apiFetch<Paginated<VaccinationDrive>>(
    `/admin/vaccination-drives${params ? `?${params.toString()}` : ''}`,
  )
export const createDrive = (data: CreateDriveInput) =>
  apiFetch<VaccinationDrive>('/admin/vaccination-drives', {
    method: 'POST',
    body: JSON.stringify(data),
  })
export const updateDrive = (id: string, data: Partial<CreateDriveInput>) =>
  apiFetch<VaccinationDrive>(`/admin/vaccination-drives/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

