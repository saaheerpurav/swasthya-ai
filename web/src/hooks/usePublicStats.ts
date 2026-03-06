import { useQuery } from '@tanstack/react-query'
import { getAdminAnalytics, getAdminStats, getPublicAlerts, listOutbreaks, listVaccinationDrives } from '../lib/api'

export function usePublicStats() {
  const stats = useQuery({
    queryKey: ['public-stats'],
    queryFn: () => getAdminStats(),
    refetchInterval: 5 * 60 * 1000,
  })

  const analytics = useQuery({
    queryKey: ['public-analytics', '30d'],
    queryFn: () => getAdminAnalytics('30d'),
    refetchInterval: 5 * 60 * 1000,
  })

  const outbreaks = useQuery({
    queryKey: ['public-outbreaks'],
    queryFn: () => listOutbreaks(new URLSearchParams({ active: 'true' })),
    refetchInterval: 5 * 60 * 1000,
  })

  const alerts = useQuery({
    queryKey: ['public-alerts'],
    queryFn: () => getPublicAlerts(),
    refetchInterval: 5 * 60 * 1000,
  })

  const drives = useQuery({
    queryKey: ['public-vaccination-drives'],
    queryFn: () => listVaccinationDrives(
      new URLSearchParams({ upcoming: 'true', limit: '5' }),
    ),
    refetchInterval: 5 * 60 * 1000,
  })

  return {
    stats,
    analytics,
    outbreaks,
    alerts,
    drives,
  }
}

