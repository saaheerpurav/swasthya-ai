export type Language = 'en' | 'hi' | 'kn' | 'te'
export type Channel = 'whatsapp' | 'sms' | 'web' | 'mobile' | 'voice'
export type Intent =
  | 'health_question'
  | 'facility_search'
  | 'vaccination_info'
  | 'emergency'
  | 'general_info'
export type SafetyFlag = 'diagnostic_request' | 'emergency_symptoms' | 'inappropriate_content'
export type AlertType = 'outbreak' | 'weather' | 'health'
export type Severity = 'critical' | 'high' | 'medium' | 'low'
export type Trend = 'up' | 'down' | 'stable'
export type FacilityType =
  | 'hospital'
  | 'clinic'
  | 'pharmacy'
  | 'phc'
  | 'chc'
  | 'vaccination_center'

export interface Stats {
  totalUsers: number
  activeUsersToday: number
  activeUsersWeek: number
  totalQueries: number
  queriesToday: number
  channelBreakdown: Record<Channel, number>
  languageBreakdown: Record<Language, number>
  escalationCount: number
  emergencyCount: number
  topQueryCategories: { category: string; count: number }[]
}

export interface Analytics {
  period: string
  queriesByDay: { date: string; count: number }[]
  userGrowthByDay: { date: string; newUsers: number; total: number }[]
  breakdown: {
    byLanguage: Record<Language, number>
    byChannel: Record<Channel, number>
    byIntent: Record<Intent, number>
    safetyEvents: { escalations: number; emergencies: number; diagnosticBlocks: number }
  }
}

export interface UserSummary {
  userId: string
  phoneNumber?: string
  preferredLanguage: Language
  channels: Channel[]
  queryCount: number
  onboardingComplete: boolean
  createdAt: string
  lastActive: string
}

export interface UserDetail {
  user: UserSummary & {
    location?: { regionCode: string; address?: string }
    privacySettings: { shareLocation: boolean; allowAlerts: boolean }
  }
  queryHistory: QuerySummary[]
  vaccinationProfile: VaccinationProfile | null
}

export interface QuerySummary {
  queryId: string
  userId: string
  channel: Channel
  originalText: string
  language: Language
  intent: Intent
  safetyFlags: SafetyFlag[]
  timestamp: string
  responsePreview: string
}

export interface Alert {
  alertId: string
  type: AlertType
  severity: Severity
  title: string
  message: string
  regionCode: string
  affectedRegions?: string[]
  sourceUrl?: string
  createdAt: string
  expiresAt: string
  active?: boolean
}

export interface Outbreak {
  outbreakId: string
  disease: string
  regionCode: string
  regionName?: string
  cases: number
  severity: Severity
  trend: Trend
  description: string
  source: string
  reportedAt: string
  active: boolean
}

export interface VaccinationDrive {
  driveId: string
  vaccines: string[]
  regionCode: string
  location: string
  address: string
  date: string
  time: string
  capacity: number
  registeredCount: number
  organizer: string
  active: boolean
}

export interface VaccinationProfile {
  profileId: string
  dateOfBirth: string
  gender: string
  vaccinations: {
    vaccineId: string
    vaccineName: string
    dateAdministered: string
    batchNumber?: string
  }[]
  upcomingVaccines: {
    vaccineId: string
    vaccineName: string
    dueDate: string
    priority: 'high' | 'medium' | 'low'
  }[]
  familyMembers: {
    memberId: string
    name: string
    relationship: string
    upcomingVaccines: unknown[]
  }[]
}

export interface Paginated<T> {
  items?: T[]
  data?: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface CreateAlertInput {
  type: AlertType
  severity: Severity
  title: string
  message: string
  affectedRegions: string[]
  expiresAt: string
  sourceUrl?: string
}

export interface CreateOutbreakInput {
  disease: string
  regionCode: string
  cases: number
  severity: Severity
  trend: Trend
  description: string
  source: string
}

export interface CreateDriveInput {
  vaccines: string[]
  regionCode: string
  location: string
  address: string
  date: string
  time: string
  capacity: number
  organizer: string
}

