import type { ReactNode } from 'react'

interface Props {
  open: boolean
  title: string
  description: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  cancelLabel?: string
  footer?: ReactNode
}

export function ConfirmDialog({
  open,
  title,
  description,
  destructive,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  footer,
}: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-950 p-4 text-xs text-slate-200 shadow-lg">
        <h2 className="text-sm font-semibold text-slate-50">{title}</h2>
        <p className="mt-2 text-[11px] text-slate-400">{description}</p>
        {footer && <div className="mt-2">{footer}</div>}
        <div className="mt-4 flex justify-end gap-2 text-[11px]">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-600 bg-slate-900 px-3 py-1 text-slate-200 hover:bg-slate-800"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-md px-3 py-1 font-semibold ${
              destructive
                ? 'bg-red-500 text-black hover:bg-red-400'
                : 'bg-green-500 text-black hover:bg-green-400'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

