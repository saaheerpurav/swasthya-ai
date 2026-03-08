import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from 'recharts'
import { getAdminAnalytics } from '../../lib/api'
import { StatCard } from '../../components/StatCard'
import { EmptyState } from '../../components/EmptyState'
import { AlertTriangle, Siren, ShieldAlert } from 'lucide-react'

const PIE_COLORS = ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6']

type Period = '7d' | '30d' | '90d'

function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<Period>('30d')

  const analytics = useQuery({
    queryKey: ['admin-analytics', period],
    queryFn: () => getAdminAnalytics(period),
  })

  const a = analytics.data
  const queriesByDay = a?.queriesByDay ?? []
  const channelData = Object.entries(a?.breakdown?.byChannel ?? {}).map(([name, value]) => ({ name, value }))
  const langData = Object.entries(a?.breakdown?.byLanguage ?? {}).map(([name, value]) => ({ name, value }))
  const intentData = Object.entries(a?.breakdown?.byIntent ?? {}).map(([name, value]) => ({ name, value }))
  const safety = a?.breakdown?.safetyEvents ?? { escalations: 0, emergencies: 0, diagnosticBlocks: 0 }

  const totalQueries = queriesByDay.reduce((s, d) => s + (d.count ?? 0), 0)
  const avgPerDay = queriesByDay.length > 0 ? Math.round(totalQueries / queriesByDay.length) : 0

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-slate-50">Analytics</h1>
          <p className="text-xs text-slate-400">Platform usage and safety event metrics.</p>
        </div>
        <div className="flex gap-1">
          {(['7d', '30d', '90d'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-lg px-2.5 py-1 text-xs transition ${
                period === p
                  ? 'bg-green-500/20 text-green-300 ring-1 ring-green-500/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {analytics.isLoading && <p className="text-xs text-slate-400">Loading analytics…</p>}

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard title={`Total Queries (${period})`} value={totalQueries} />
        <StatCard title="Avg / Day" value={avgPerDay} />
        <StatCard title="Escalations" value={safety.escalations} icon={AlertTriangle} />
        <StatCard title="Emergencies" value={safety.emergencies} icon={Siren} accentColor="#EF4444" />
      </div>

      {/* Safety events */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
        <p className="mb-3 text-xs font-semibold text-slate-100">Safety Events</p>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-400" />
              <p className="text-xs text-slate-300">Escalations</p>
            </div>
            <p className="mt-1 text-xl font-bold tabular-nums text-orange-300">{safety.escalations}</p>
            <p className="mt-0.5 text-[10px] text-slate-500">Users referred to health workers</p>
          </div>
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
            <div className="flex items-center gap-2">
              <Siren className="h-4 w-4 text-red-400" />
              <p className="text-xs text-slate-300">Emergencies</p>
            </div>
            <p className="mt-1 text-xl font-bold tabular-nums text-red-300">{safety.emergencies}</p>
            <p className="mt-0.5 text-[10px] text-slate-500">Emergency symptoms detected</p>
          </div>
          <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-yellow-400" />
              <p className="text-xs text-slate-300">Diagnostic Blocks</p>
            </div>
            <p className="mt-1 text-xl font-bold tabular-nums text-yellow-300">{safety.diagnosticBlocks}</p>
            <p className="mt-0.5 text-[10px] text-slate-500">Queries blocked by safety filter</p>
          </div>
        </div>
      </div>

      {/* Query volume over time */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
        <p className="mb-2 text-xs font-semibold text-slate-100">Query Volume — {period}</p>
        {queriesByDay.length === 0 ? (
          <EmptyState title="No data" description="Query trend data will appear here." />
        ) : (
          <AreaChart data={queriesByDay} width={700} height={180}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#6B7280' }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 9, fill: '#6B7280' }} width={28} />
            <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1F2937', fontSize: 10 }} />
            <Area type="monotone" dataKey="count" stroke="#22C55E" fill="#22C55E22" name="Queries" />
            {(queriesByDay[0] as any)?.newUsers !== undefined && (
              <Area type="monotone" dataKey="newUsers" stroke="#3B82F6" fill="#3B82F622" name="New Users" />
            )}
          </AreaChart>
        )}
      </div>

      {/* Breakdowns */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
          <p className="mb-2 text-xs font-semibold text-slate-100">By Channel</p>
          {channelData.length === 0 ? (
            <EmptyState title="No data" description="" />
          ) : (
            <PieChart width={220} height={160}>
              <Pie data={channelData} dataKey="value" nameKey="name" cx="40%" cy="50%" outerRadius={55}>
                {channelData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1F2937', fontSize: 10 }} />
              <Legend wrapperStyle={{ fontSize: 9, color: '#9CA3AF' }} layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
          )}
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
          <p className="mb-2 text-xs font-semibold text-slate-100">By Language</p>
          {langData.length === 0 ? (
            <EmptyState title="No data" description="" />
          ) : (
            <BarChart data={langData} width={220} height={160}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#6B7280' }} />
              <YAxis tick={{ fontSize: 9, fill: '#6B7280' }} width={24} />
              <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1F2937', fontSize: 10 }} />
              <Bar dataKey="value" fill="#3B82F6" radius={[3, 3, 0, 0]} />
            </BarChart>
          )}
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
          <p className="mb-2 text-xs font-semibold text-slate-100">By Intent</p>
          {intentData.length === 0 ? (
            <EmptyState title="No data" description="" />
          ) : (
            <BarChart layout="vertical" data={intentData} width={220} height={160}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis type="number" tick={{ fontSize: 9, fill: '#6B7280' }} />
              <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 9, fill: '#6B7280' }} />
              <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1F2937', fontSize: 10 }} />
              <Bar dataKey="value" fill="#F59E0B" radius={[0, 3, 3, 0]} />
            </BarChart>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminAnalyticsPage
