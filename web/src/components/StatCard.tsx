import type { LucideIcon } from 'lucide-react'
import { cn, formatNumber } from '../lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  trend?: { value: number; direction: 'up' | 'down'; positive?: boolean }
  icon?: LucideIcon
  accentColor?: string
}

export function StatCard({
  title,
  value,
  description,
  trend,
  icon: Icon,
  accentColor,
}: StatCardProps) {
  const formatted =
    typeof value === 'number' && Number.isFinite(value) ? formatNumber(value) : value

  const trendColor =
    trend && trend.positive !== undefined
      ? trend.direction === 'up'
        ? trend.positive
          ? 'text-emerald-400'
          : 'text-red-400'
        : trend.positive
          ? 'text-red-400'
          : 'text-emerald-400'
      : 'text-slate-300'

  const trendLabel =
    trend && `${trend.direction === 'up' ? '▲' : '▼'} ${Math.abs(trend.value)}%`

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-800/60 bg-slate-950/60 p-3 text-xs text-slate-200 transition hover:border-slate-700 hover:bg-slate-900/70">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{title}</p>
          <p
            className={cn(
              'mt-1.5 text-xl font-bold tabular-nums',
              accentColor ? `text-[${accentColor}]` : 'text-slate-50',
            )}
          >
            {formatted}
          </p>
        </div>
        {Icon && (
          <div className="rounded-lg bg-slate-800/80 p-2">
            <Icon
              className="h-3.5 w-3.5"
              style={{ color: accentColor ?? '#86efac' }}
            />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        {description && (
          <p className="text-[10px] text-slate-500 line-clamp-2">{description}</p>
        )}
        {trend && (
          <span className={cn('ml-auto text-[10px] font-semibold', trendColor)}>
            {trendLabel}
          </span>
        )}
      </div>
    </div>
  )
}

