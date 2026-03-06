import type { Severity } from '../types'
import { cn } from '../lib/utils'

interface Props {
  severity: Severity
}

export function SeverityBadge({ severity }: Props) {
  const color = {
    critical: 'bg-red-500/15 text-red-300 border-red-500/40',
    high: 'bg-orange-500/15 text-orange-300 border-orange-500/40',
    medium: 'bg-yellow-500/15 text-yellow-200 border-yellow-500/40',
    low: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
  }[severity]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize',
        color,
      )}
    >
      {severity}
    </span>
  )
}

