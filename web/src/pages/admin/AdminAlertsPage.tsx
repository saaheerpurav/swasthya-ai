import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Pencil, X } from 'lucide-react'
import { listAlerts, createAlert, updateAlert, deleteAlert } from '../../lib/api'
import { SeverityBadge } from '../../components/SeverityBadge'
import { RelativeTime } from '../../components/RelativeTime'
import { EmptyState } from '../../components/EmptyState'
import { REGIONS } from '../../constants/regions'
import type { Alert, CreateAlertInput, Severity } from '../../types'

const REGION_OPTIONS = REGIONS.map((r) => ({ value: r.code, label: `${r.name}, ${r.state}` }))

const EMPTY_FORM: CreateAlertInput & { active?: boolean } = {
  type: 'health',
  severity: 'medium',
  title: '',
  message: '',
  affectedRegions: [],
  expiresAt: '',
  sourceUrl: '',
}

function severityColor(s: Severity) {
  return s === 'critical' ? 'text-red-400' : s === 'high' ? 'text-orange-400' : s === 'medium' ? 'text-yellow-400' : 'text-green-400'
}

function AlertModal({
  initial,
  onClose,
  onSave,
}: {
  initial: Partial<CreateAlertInput>
  onClose: () => void
  onSave: (data: CreateAlertInput) => void
}) {
  const [form, setForm] = useState<CreateAlertInput>({
    ...EMPTY_FORM,
    ...initial,
  })

  const set = (k: keyof CreateAlertInput, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }))

  const toggleRegion = (code: string) => {
    const regions = form.affectedRegions.includes(code)
      ? form.affectedRegions.filter((r) => r !== code)
      : [...form.affectedRegions, code]
    set('affectedRegions', regions)
  }

  const valid = form.title && form.message && form.affectedRegions.length > 0 && form.expiresAt

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
        <button onClick={onClose} className="absolute right-3 top-3 text-slate-500 hover:text-slate-200">
          <X className="h-4 w-4" />
        </button>
        <h2 className="mb-4 text-sm font-semibold text-slate-100">
          {initial.title ? 'Edit Alert' : 'New Alert'}
        </h2>
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-slate-400">Type</span>
              <select
                className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-100"
                value={form.type}
                onChange={(e) => set('type', e.target.value)}
              >
                {['outbreak', 'weather', 'health', 'disease', 'vaccination'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-slate-400">Severity</span>
              <select
                className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-100"
                value={form.severity}
                onChange={(e) => set('severity', e.target.value)}
              >
                {['critical', 'high', 'medium', 'low', 'info'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-slate-400">Title</span>
            <input
              className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-100 placeholder:text-slate-600"
              placeholder="Alert title"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-slate-400">Message</span>
            <textarea
              className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-100 placeholder:text-slate-600"
              rows={3}
              placeholder="Alert message"
              value={form.message}
              onChange={(e) => set('message', e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-slate-400">Expires At</span>
            <input
              type="datetime-local"
              className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-100"
              value={form.expiresAt ? form.expiresAt.slice(0, 16) : ''}
              onChange={(e) => set('expiresAt', e.target.value ? new Date(e.target.value).toISOString() : '')}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-slate-400">Source URL (optional)</span>
            <input
              className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-100 placeholder:text-slate-600"
              placeholder="https://..."
              value={form.sourceUrl ?? ''}
              onChange={(e) => set('sourceUrl', e.target.value)}
            />
          </label>
          <div>
            <p className="mb-1 text-slate-400">Affected Regions</p>
            <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
              {REGION_OPTIONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => toggleRegion(r.value)}
                  className={`rounded-full px-2 py-0.5 text-[10px] transition ${
                    form.affectedRegions.includes(r.value)
                      ? 'bg-green-500/20 text-green-300 ring-1 ring-green-500/40'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200">
            Cancel
          </button>
          <button
            disabled={!valid}
            onClick={() => onSave(form)}
            className="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-green-400 disabled:opacity-40"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

function AdminAlertsPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState<{ open: boolean; editing?: Alert }>({ open: false })

  const alerts = useQuery({
    queryKey: ['admin-alerts'],
    queryFn: () => listAlerts(),
  })

  const create = useMutation({
    mutationFn: createAlert,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-alerts'] }); setModal({ open: false }) },
  })

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAlertInput> }) => updateAlert(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-alerts'] }); setModal({ open: false }) },
  })

  const del = useMutation({
    mutationFn: deleteAlert,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-alerts'] }),
  })

  const items: Alert[] = alerts.data?.alerts ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-slate-50">Health Alerts</h1>
          <p className="text-xs text-slate-400">{items.length} alert{items.length !== 1 ? 's' : ''} total</p>
        </div>
        <button
          onClick={() => setModal({ open: true })}
          className="flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-green-400"
        >
          <Plus className="h-3.5 w-3.5" /> New Alert
        </button>
      </div>

      {alerts.isLoading && <p className="text-xs text-slate-400">Loading alerts…</p>}
      {!alerts.isLoading && items.length === 0 && (
        <EmptyState title="No alerts" description="Create the first health alert for your region." />
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((a) => (
          <div key={a.alertId} className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
            <div className="mb-1.5 flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <SeverityBadge severity={a.severity} />
                <span className="text-[10px] uppercase text-slate-400">{a.type}</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setModal({ open: true, editing: a })}
                  className="rounded p-0.5 text-slate-500 hover:text-slate-200"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  onClick={() => { if (confirm('Delete this alert?')) del.mutate(a.alertId) }}
                  className="rounded p-0.5 text-slate-500 hover:text-red-400"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-100 line-clamp-2">{a.title}</p>
            <p className="mt-1 text-[11px] text-slate-400 line-clamp-2">{a.message}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
              <span>{a.regionCode}</span>
              <span>·</span>
              <span>Expires <RelativeTime timestamp={a.expiresAt} /></span>
              <span>·</span>
              <span className={a.active !== false ? 'text-green-400' : 'text-slate-500'}>
                {a.active !== false ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {modal.open && (
        <AlertModal
          initial={modal.editing
            ? {
                type: modal.editing.type,
                severity: modal.editing.severity,
                title: modal.editing.title,
                message: modal.editing.message,
                affectedRegions: modal.editing.affectedRegions ?? [modal.editing.regionCode],
                expiresAt: modal.editing.expiresAt,
                sourceUrl: modal.editing.sourceUrl,
              }
            : {}
          }
          onClose={() => setModal({ open: false })}
          onSave={(data) => {
            if (modal.editing) {
              update.mutate({ id: modal.editing.alertId, data })
            } else {
              create.mutate(data)
            }
          }}
        />
      )}
    </div>
  )
}

export default AdminAlertsPage
