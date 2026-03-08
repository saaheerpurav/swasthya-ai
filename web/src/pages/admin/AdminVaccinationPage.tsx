import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Users } from 'lucide-react'
import { listVaccinationDrives, createDrive, updateDrive } from '../../lib/api'
import { EmptyState } from '../../components/EmptyState'
import { REGIONS } from '../../constants/regions'
import type { VaccinationDrive, CreateDriveInput } from '../../types'

const REGION_OPTIONS = REGIONS.map((r) => ({ value: r.code, label: `${r.name}, ${r.state}` }))

const EMPTY_FORM: CreateDriveInput = {
  vaccines: [],
  regionCode: '',
  location: '',
  address: '',
  date: '',
  time: '',
  capacity: 100,
  organizer: '',
}

const VACCINE_LIST = ['BCG', 'OPV', 'DPT', 'MMR', 'Hepatitis B', 'Typhoid', 'COVID-19', 'Influenza', 'Polio', 'Rotavirus']

function DriveModal({
  initial,
  onClose,
  onSave,
}: {
  initial: Partial<CreateDriveInput>
  onClose: () => void
  onSave: (data: CreateDriveInput) => void
}) {
  const [form, setForm] = useState<CreateDriveInput>({ ...EMPTY_FORM, ...initial })
  const set = (k: keyof CreateDriveInput, v: unknown) => setForm((f) => ({ ...f, [k]: v }))
  const toggleVaccine = (v: string) => {
    const arr = form.vaccines.includes(v) ? form.vaccines.filter((x) => x !== v) : [...form.vaccines, v]
    set('vaccines', arr)
  }
  const valid = form.vaccines.length > 0 && form.regionCode && form.location && form.date && form.organizer

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
        <button onClick={onClose} className="absolute right-3 top-3 text-slate-500 hover:text-slate-200 text-lg leading-none">×</button>
        <h2 className="mb-4 text-sm font-semibold text-slate-100">
          {initial.location ? 'Edit Drive' : 'Schedule Drive'}
        </h2>
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-slate-400">Region</span>
              <select
                className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-100"
                value={form.regionCode}
                onChange={(e) => set('regionCode', e.target.value)}
              >
                <option value="">Select…</option>
                {REGION_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-slate-400">Date</span>
              <input
                type="date"
                className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-100"
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-slate-400">Time</span>
              <input
                type="time"
                className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-100"
                value={form.time}
                onChange={(e) => set('time', e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-slate-400">Capacity</span>
              <input
                type="number"
                className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-100"
                value={form.capacity}
                onChange={(e) => set('capacity', parseInt(e.target.value) || 0)}
              />
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-slate-400">Location / Venue</span>
            <input
              className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-100 placeholder:text-slate-600"
              placeholder="e.g. PHC Koramangala"
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-slate-400">Address</span>
            <input
              className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-100 placeholder:text-slate-600"
              placeholder="Full address"
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-slate-400">Organizer</span>
            <input
              className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-100 placeholder:text-slate-600"
              placeholder="Dept of Health / NGO name"
              value={form.organizer}
              onChange={(e) => set('organizer', e.target.value)}
            />
          </label>
          <div>
            <p className="mb-1 text-slate-400">Vaccines</p>
            <div className="flex flex-wrap gap-1.5">
              {VACCINE_LIST.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => toggleVaccine(v)}
                  className={`rounded-full px-2 py-0.5 text-[10px] transition ${
                    form.vaccines.includes(v)
                      ? 'bg-green-500/20 text-green-300 ring-1 ring-green-500/40'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
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

function AdminVaccinationPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState<{ open: boolean; editing?: VaccinationDrive }>({ open: false })

  const drives = useQuery({
    queryKey: ['admin-drives'],
    queryFn: () => listVaccinationDrives(new URLSearchParams({ limit: '50', page: '1' })),
  })

  const create = useMutation({
    mutationFn: createDrive,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-drives'] }); setModal({ open: false }) },
  })

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateDriveInput> }) => updateDrive(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-drives'] }); setModal({ open: false }) },
  })

  const items: VaccinationDrive[] = drives.data?.items ?? []
  const upcoming = items.filter((d) => d.active !== false)
  const past = items.filter((d) => d.active === false)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-slate-50">Vaccination Drives</h1>
          <p className="text-xs text-slate-400">{upcoming.length} upcoming · {past.length} past</p>
        </div>
        <button
          onClick={() => setModal({ open: true })}
          className="flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-green-400"
        >
          <Plus className="h-3.5 w-3.5" /> Schedule Drive
        </button>
      </div>

      {drives.isLoading && <p className="text-xs text-slate-400">Loading drives…</p>}
      {!drives.isLoading && items.length === 0 && (
        <EmptyState title="No drives scheduled" description="Schedule the first vaccination drive." />
      )}

      {upcoming.length > 0 && (
        <section>
          <p className="mb-2 text-xs font-semibold text-slate-300">Upcoming</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((d) => <DriveCard key={d.driveId} drive={d} onEdit={() => setModal({ open: true, editing: d })} />)}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <p className="mb-2 text-xs font-semibold text-slate-400">Past / Inactive</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 opacity-60">
            {past.map((d) => <DriveCard key={d.driveId} drive={d} onEdit={() => setModal({ open: true, editing: d })} />)}
          </div>
        </section>
      )}

      {modal.open && (
        <DriveModal
          initial={modal.editing
            ? {
                vaccines: modal.editing.vaccines,
                regionCode: modal.editing.regionCode,
                location: modal.editing.location,
                address: modal.editing.address,
                date: modal.editing.date,
                time: modal.editing.time,
                capacity: modal.editing.capacity,
                organizer: modal.editing.organizer,
              }
            : {}
          }
          onClose={() => setModal({ open: false })}
          onSave={(data) => {
            if (modal.editing) {
              update.mutate({ id: modal.editing.driveId, data })
            } else {
              create.mutate(data)
            }
          }}
        />
      )}
    </div>
  )
}

function DriveCard({ drive: d, onEdit }: { drive: VaccinationDrive; onEdit: () => void }) {
  const pct = d.capacity > 0 ? Math.round((d.registeredCount / d.capacity) * 100) : 0

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-slate-100">{d.location}</p>
        <button onClick={onEdit} className="rounded p-0.5 text-slate-500 hover:text-slate-200">
          <Pencil className="h-3 w-3" />
        </button>
      </div>
      <p className="text-[11px] text-slate-400">{d.regionCode}</p>
      <p className="mt-1 text-[11px] text-slate-300 line-clamp-1">
        {d.vaccines.join(', ')}
      </p>
      <p className="mt-0.5 text-[11px] text-slate-500">Organiser: {d.organizer}</p>
      <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500">
        <span>{d.date ? new Date(d.date).toLocaleDateString() : '—'}</span>
        {d.time && <><span>·</span><span>{d.time}</span></>}
      </div>
      {/* Capacity bar */}
      <div className="mt-2">
        <div className="mb-0.5 flex items-center justify-between text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><Users className="h-2.5 w-2.5" /> {d.registeredCount}/{d.capacity}</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1 w-full rounded-full bg-slate-800">
          <div
            className="h-1 rounded-full bg-green-500 transition-all"
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default AdminVaccinationPage
