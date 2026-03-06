import type { Intent } from '../types'
import { cn } from '../lib/utils'

interface Props {
  intent: Intent
}

export function IntentBadge({ intent }: Props) {
  const color = {
    emergency: 'bg-red-500/15 text-red-300 border-red-500/40',
    health_question: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
    vaccination_info: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    facility_search: 'bg-teal-500/15 text-teal-300 border-teal-500/40',
    general_info: 'bg-slate-500/15 text-slate-200 border-slate-500/40',
  }[intent]

  const label: Record<Intent, string> = {
    emergency: 'Emergency',
    health_question: 'Health Question',
    vaccination_info: 'Vaccination Info',
    facility_search: 'Facility Search',
    general_info: 'General Info',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
        color,
      )}
    >
      {label[intent]}
    </span>
  )
}

