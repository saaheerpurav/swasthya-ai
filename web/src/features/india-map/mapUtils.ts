import type { Outbreak, Severity } from '../../types'
import { STATE_REGIONS } from '../../constants/regions'

export function computeStateSeverity(
  outbreaks: Outbreak[],
): Record<string, Severity | null> {
  const byRegion: Record<string, Outbreak[]> = {}

  for (const o of outbreaks) {
    if (!byRegion[o.regionCode]) byRegion[o.regionCode] = []
    byRegion[o.regionCode].push(o)
  }

  const severityRank: Record<Severity, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  }

  const stateSeverity: Record<string, Severity | null> = {}

  for (const [stateCode, regionCodes] of Object.entries(STATE_REGIONS)) {
    let best: Severity | null = null
    let bestRank = 0
    for (const code of regionCodes) {
      const regionOutbreaks = byRegion[code] ?? []
      for (const o of regionOutbreaks) {
        const rank = severityRank[o.severity]
        if (rank > bestRank) {
          bestRank = rank
          best = o.severity
        }
      }
    }
    stateSeverity[stateCode] = best
  }

  return stateSeverity
}

export function severityColor(severity: Severity | null): string {
  if (!severity) return '#E8F5E9'
  switch (severity) {
    case 'low':
      return '#A5D6A7'
    case 'medium':
      return '#FFF59D'
    case 'high':
      return '#FFAB40'
    case 'critical':
      return '#EF5350'
    default:
      return '#E8F5E9'
  }
}

