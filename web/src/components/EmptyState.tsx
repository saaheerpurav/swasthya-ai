import type { ReactNode } from 'react'

interface Props {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 bg-slate-950/60 px-4 py-6 text-center text-xs text-slate-300">
      {icon && <div className="mb-1 text-slate-500">{icon}</div>}
      <p className="text-sm font-medium text-slate-100">{title}</p>
      {description && (
        <p className="max-w-sm text-[11px] text-slate-400">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

