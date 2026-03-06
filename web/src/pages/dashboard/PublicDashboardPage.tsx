import { MessageCircle, Users, Bell, AlertTriangle, Siren } from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { usePublicStats } from '../../hooks/usePublicStats'
import { IndiaMap } from '../../features/india-map/IndiaMap'
import { StatCard } from '../../components/StatCard'
import { SeverityBadge } from '../../components/SeverityBadge'
import { RelativeTime } from '../../components/RelativeTime'
import { EmptyState } from '../../components/EmptyState'
import type { Alert as AlertType } from '../../types'
import { REGIONS } from '../../constants/regions'

function regionNameFromCode(code: string) {
  return REGIONS.find((r) => r.code === code)?.name ?? code
}

function PublicDashboardPage() {
  const { stats, analytics, outbreaks, alerts, drives } = usePublicStats()

  const allAlerts: AlertType[] = alerts.data?.alerts ?? []
  const activeAlerts = allAlerts.filter((a) => a.active !== false)

  const queriesByDay = analytics.data?.queriesByDay ?? []
  const channelBreakdown = analytics.data?.breakdown.byChannel ?? {}
  const topDiseases = stats.data?.topQueryCategories ?? []

  const channelData = Object.entries(channelBreakdown).map(([name, value]) => ({
    name,
    value,
  }))

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-800/70 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5 text-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-green-500 text-xs font-bold text-black">+</div>
            <span className="font-semibold tracking-tight">SwasthyaAI</span>
            <span className="hidden text-xs text-slate-500 sm:block">India Public Health Dashboard</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
              Live
            </span>
            <span className="hidden sm:inline">
              {stats.data ? <RelativeTime timestamp={new Date().toISOString()} /> : '—'}
            </span>
            <a href="/admin" className="rounded-md border border-slate-700 px-2.5 py-1 text-xs text-slate-300 transition hover:border-slate-500 hover:text-white">
              Admin →
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4">
        {/* Map + Alerts */}
        <section className="grid gap-4 md:grid-cols-[320px_minmax(0,1fr)] md:items-stretch">
          <aside className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/80 p-3">
            <div className="mb-2 flex items-center justify-between text-xs">
              <h2 className="text-sm font-semibold text-slate-100">
                Active Alerts ({activeAlerts.length})
              </h2>
              {activeAlerts.some((a) => a.severity === 'critical') && (
                <span className="flex items-center gap-1 text-[10px] text-red-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                  Critical
                </span>
              )}
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto pr-1 text-xs">
              {alerts.isLoading && (
                <p className="text-[11px] text-slate-400">Loading alerts…</p>
              )}
              {!alerts.isLoading && activeAlerts.length === 0 && (
                <EmptyState
                  title="No alerts found"
                  description="No active health alerts across India right now."
                />
              )}
              {activeAlerts.map((a) => (
                <div
                  key={a.alertId}
                  className="rounded-lg border border-slate-800 bg-slate-950/60 p-2"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <SeverityBadge severity={a.severity} />
                      <span className="text-[10px] uppercase text-slate-400">
                        {a.type}
                      </span>
                    </div>
                    <RelativeTime timestamp={a.createdAt} />
                  </div>
                  <p className="text-xs font-semibold text-slate-100 line-clamp-2">
                    {a.title}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {regionNameFromCode(a.regionCode)}
                  </p>
                </div>
              ))}
            </div>
          </aside>

          <section className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/80 p-3">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
              <span>India – Outbreak Intensity Map</span>
              <span className="text-[10px] text-slate-400">
                Choropleth powered by react-simple-maps
              </span>
            </div>
            <div className="flex-1 rounded-lg border border-slate-800 bg-slate-950/60 p-1">
              {outbreaks.isLoading ? (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">
                  Loading outbreaks…
                </div>
              ) : (
                <IndiaMap outbreaks={outbreaks.data?.items ?? outbreaks.data?.data ?? []} />
              )}
            </div>
            <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-400">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-3 rounded-sm bg-[#E8F5E9]" /> No outbreaks
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-3 rounded-sm bg-[#A5D6A7]" /> Low
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-3 rounded-sm bg-[#FFF59D]" /> Medium
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-3 rounded-sm bg-[#FFAB40]" /> High
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-3 rounded-sm bg-[#EF5350]" /> Critical
              </span>
            </div>
          </section>
        </section>

        {/* Stat bar */}
        <section className="grid gap-3 rounded-xl border border-slate-800/60 bg-slate-900/60 p-3 text-xs text-slate-300 backdrop-blur md:grid-cols-5">
          <StatCard
            title="Queries Today"
            value={stats.data?.queriesToday ?? '—'}
            icon={MessageCircle}
          />
          <StatCard
            title="Active Users Today"
            value={stats.data?.activeUsersToday ?? '—'}
            icon={Users}
          />
          <StatCard
            title="Active Alerts"
            value={activeAlerts.length}
            icon={Bell}
          />
          <StatCard
            title="Escalations"
            value={stats.data?.escalationCount ?? '—'}
            icon={AlertTriangle}
          />
          <StatCard
            title="Emergency Events"
            value={stats.data?.emergencyCount ?? '—'}
            icon={Siren}
            accentColor="#EF4444"
          />
        </section>

        {/* Charts row */}
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
            <p className="text-xs font-semibold text-slate-100">
              Query Volume – Last 30 Days
            </p>
            <div className="mt-2 h-40">
              <AreaChart data={queriesByDay} width={400} height={160}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#020617',
                    borderColor: '#1F2937',
                    fontSize: 10,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#22C55E"
                  fill="#22C55E33"
                />
              </AreaChart>
            </div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
            <p className="text-xs font-semibold text-slate-100">Channel Breakdown</p>
            <div className="mt-2 flex h-40 items-center justify-center">
              <PieChart width={200} height={160}>
                <Pie
                  data={channelData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={50}
                  fill="#22C55E"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#020617',
                    borderColor: '#1F2937',
                    fontSize: 10,
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 10, color: '#cbd5f5' }}
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                />
              </PieChart>
            </div>
          </div>
        </section>

        {/* Top diseases + vaccination drives */}
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
            <p className="text-xs font-semibold text-slate-100">
              Top Diseases This Week
            </p>
            <div className="mt-3 h-40">
              <BarChart
                layout="vertical"
                width={400}
                height={160}
                data={topDiseases.slice(0, 5)}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="category"
                  type="category"
                  width={90}
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#020617',
                    borderColor: '#1F2937',
                    fontSize: 10,
                  }}
                />
                <Bar dataKey="count" fill="#22C55E" />
              </BarChart>
            </div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
            <p className="text-xs font-semibold text-slate-100">
              Upcoming Vaccination Drives
            </p>
            <div className="mt-2 space-y-2 text-xs">
              {drives.isLoading && (
                <p className="text-[11px] text-slate-400">Loading drives…</p>
              )}
              {!drives.isLoading &&
              (drives.data?.items?.length ?? drives.data?.data?.length ?? 0) === 0 ? (
                <EmptyState
                  title="No scheduled drives"
                  description="When drives are scheduled they will appear here with date, vaccines, and organiser."
                />
              ) : (
                (drives.data?.items ?? drives.data?.data ?? []).map((d) => (
                  <div
                    key={d.driveId}
                    className="rounded-lg border border-slate-800 bg-slate-950/60 p-2"
                  >
                    <p className="text-xs font-semibold text-slate-100">{d.location}</p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {new Date(d.date).toLocaleDateString()} ·{' '}
                      {regionNameFromCode(d.regionCode)}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-300 line-clamp-1">
                      Vaccines: {d.vaccines.join(', ')}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Organiser: {d.organizer}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default PublicDashboardPage

