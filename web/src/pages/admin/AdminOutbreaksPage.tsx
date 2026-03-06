import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { listOutbreaks, createOutbreak, updateOutbreak } from '../../lib/api'
import { SeverityBadge } from '../../components/SeverityBadge'
import { RelativeTime } from '../../components/RelativeTime'
import { EmptyState } from '../../components/EmptyState'
import { REGIONS } from '../../constants/regions'
import type { Outbreak, CreateOutbreakInput, Severity, Trend } from '../../types'

const REGION_OPTIONS = REGIONS.map((r) => ({ value: r.code, label: `${r.name}, ${r.state}` }))

const EMPTY_FORM: CreateOutbreakInput = {
  disease: '',
  regionCode: '',
  cases: 0,
  severity: 'medium',
  trend: 'stable',
  description: '',
  source: '',
}

function TrendIcon({ trend }: { trend: Trend }) {
  if (trend === 'up') return <TrendingUp className="h-3 w-3 text-red-400" />
  if (trend === 'down') return <TrendingDown className="h-3 w-3 text-green-400" />
  return <Minus className="h-3 w-3 text-slate-400" />
}

function OutbreakModal({
  initial,
  onClose,
  onSave,
}: {
  initial: Partial<CreateOutbreakInput>
  onClose: () => void
  onSave: (data: CreateOutbreakInput) => void
}) {
  const [form, setForm] = useState<CreateOutbreakInput>({ ...EMPTY_FORM, ...initial })
  const set = (k: keyof CreateOutbreakInput, v: unknown) => setForm((f) => ({ ...f, [k]: v }))
  const valid = form.disease && form.regionCode && form.description

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
        <button onClick={onClose} className="absolute right-3 top-3 text-slate-500 hover:text-slate-200 text-lg leading-none">×</button>
        <h2 className="mb-4 text-sm font-semibold text-slate-100">
          {initial.disease ? 'Edit Outbreak' : 'Report Outbreak'}
        </h2>
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-slate-400">Disease</span>
              <input
                className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-100 placeholder:text-slate-600"
                placeholder="e.g. Dengue"
                value={form.disease}
                onChange={(e) => set('disease', e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-slate-400">Region</span>
              <select
                className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-100"
                value={form.regionCode}
                onChange={(e) => set('regionCode', e.target.value)}
              >
                <option value="">Select region…</option>
                {REGION_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </label>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-slate-400">Cases</span>
              <input
                type="number"
                className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-100"
                value={form.cases}
                onChange={(e) => set('cases', parseInt(e.target.value) || 0)}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-slate-400">Severity</span>
              <select
                className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-100"
                value={form.severity}
                onChange={(e) => set('severity', e.target.value)}
              >
                {['critical', 'high', 'medium', 'low'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-slate-400">Trend</span>
              <select
                className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-100"
                value={form.trend}
                onChange={(e) => set('trend', e.target.value)}
              >
                {['up', 'down', 'stable'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-slate-400">Description</span>
            <textarea
              className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-100 placeholder:text-slate-600"
              rows={3}
              placeholder="Describe the outbreak situation…"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-slate-400">Source</span>
            <input
              className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-100 placeholder:text-slate-600"
              placeholder="WHO / State Health Dept"
              value={form.source}
              onChange={(e) => set('source', e.target.value)}
            />
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200">Cancel</button>
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

function AdminOutbreaksPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState<{ open: boolean; editing?: Outbreak }>({ open: false })
  const [activeOnly, setActiveOnly] = useState(true)

  const outbreaks = useQuery({
    queryKey: ['admin-outbreaks', activeOnly],
    queryFn: () => {
      const p = new URLSearchParams({ limit: '50', page: '1' })
      if (activeOnly) p.set('active', 'true')
      return listOutbreaks(p)
    },
  })

  const create = useMutation({
    mutationFn: createOutbreak,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-outbreaks'] }); setModal({ open: false }) },
  })

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateOutbreakInput> }) => updateOutbreak(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-outbreaks'] }); setModal({ open: false }) },
  })

  const items: Outbreak[] = outbreaks.data?.items ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-slate-50">Outbreaks</h1>
          <p className="text-xs text-slate-400">{items.length} outbreak{items.length !== 1 ? 's' : ''} reported</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-400">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
              className="accent-green-500"
            />
            Active only
          </label>
          <button
            onClick={() => setModal({ open: true })}
            className="flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-green-400"
          >
            <Plus className="h-3.5 w-3.5" /> Report
          </button>
        </div>
      </div>

      {outbreaks.isLoading && <p className="text-xs text-slate-400">Loading outbreaks…</p>}
      {!outbreaks.isLoading && items.length === 0 && (
        <EmptyState title="No outbreaks" description="No active disease outbreaks reported." />
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((o) => (
          <div key={o.outbreakId} className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
            <div className="mb-1.5 flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <SeverityBadge severity={o.severity} />
                <TrendIcon trend={o.trend} />
              </div>
              <button
                onClick={() => setModal({ open: true, editing: o })}
                className="rounded p-0.5 text-slate-500 hover:text-slate-200"
              >
                <Pencil className="h-3 w-3" />
              </button>
            </div>
            <p className="text-xs font-semibold text-slate-100">{o.disease}</p>
            <p className="mt-0.5 text-[11px] text-slate-400">{o.regionCode}</p>
            <p className="mt-1 text-[11px] text-slate-300 line-clamp-2">{o.description}</p>
            <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-500">
              <span>{o.cases?.toLocaleString()} cases</span>
              <span>·</span>
              <RelativeTime timestamp={o.reportedAt} />
              <span>·</span>
              <span className={o.active ? 'text-green-400' : 'text-slate-500'}>
                {o.active ? 'Active' : 'Resolved'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {modal.open && (
        <OutbreakModal
          initial={modal.editing
            ? {
                disease: modal.editing.disease,
                regionCode: modal.editing.regionCode,
                cases: modal.editing.cases,
                severity: modal.editing.severity,
                trend: modal.editing.trend,
                description: modal.editing.description,
                source: modal.editing.source,
              }
            : {}
          }
          onClose={() => setModal({ open: false })}
          onSave={(data) => {
            if (modal.editing) {
              update.mutate({ id: modal.editing.outbreakId, data })
            } else {
              create.mutate(data)
            }
          }}
        />
      )}
    </div>
  )
}

export default AdminOutbreaksPage
