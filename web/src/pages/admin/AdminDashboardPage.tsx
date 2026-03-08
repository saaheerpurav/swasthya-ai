'use client'

import { useQuery } from '@tanstack/react-query'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from 'recharts'
import {
  Users, MessageCircle, AlertTriangle, Siren, Activity,
  TrendingUp, Clock,
} from 'lucide-react'
import { getAdminStats, getAdminAnalytics, listQueries } from '../../lib/api'
import { StatCard } from '../../components/StatCard'
import { SeverityBadge } from '../../components/SeverityBadge'
import { ChannelBadge } from '../../components/ChannelBadge'
import { RelativeTime } from '../../components/RelativeTime'
import { EmptyState } from '../../components/EmptyState'

const PIE_COLORS = ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6']

function AdminDashboardPage() {
  const stats = useQuery({ queryKey: ['admin-stats'], queryFn: getAdminStats, refetchInterval: 30000 })
  const analytics = useQuery({ queryKey: ['admin-analytics', '7d'], queryFn: () => getAdminAnalytics('7d') })
  const recentQueries = useQuery({
    queryKey: ['admin-queries-recent'],
    queryFn: () => listQueries(new URLSearchParams({ limit: '8', page: '1' })),
  })

  const s = stats.data
  const a = analytics.data
  const queriesByDay = a?.queriesByDay ?? []
  const channelData = Object.entries(a?.breakdown?.byChannel ?? {}).map(([name, value]) => ({ name, value }))
  const langData = Object.entries(a?.breakdown?.byLanguage ?? {}).map(([name, value]) => ({ name, value }))
  const recentItems = recentQueries.data?.items ?? []

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-base font-semibold text-slate-50">Overview</h1>
        <p className="text-xs text-slate-400">Live platform health and usage metrics.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard title="Total Users" value={s?.totalUsers ?? '—'} icon={Users} />
        <StatCard title="Queries Today" value={s?.queriesToday ?? '—'} icon={MessageCircle} />
        <StatCard title="Escalations" value={s?.escalationCount ?? '—'} icon={AlertTriangle} />
        <StatCard title="Emergencies" value={s?.emergencyCount ?? '—'} icon={Siren} accentColor="#EF4444" />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard title="Active Today" value={s?.activeUsersToday ?? '—'} icon={Activity} />
        <StatCard title="Active (7d)" value={(s as any)?.activeUsers7d ?? (s as any)?.activeUsersWeek ?? '—'} icon={TrendingUp} />
        <StatCard title="Total Queries" value={s?.totalQueries ?? '—'} icon={MessageCircle} />
        <StatCard title="Avg Response" value={s ? `${(s as any).avgResponseTime ?? '—'}ms` : '—'} icon={Clock} />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
          <p className="mb-2 text-xs font-semibold text-slate-100">Query Volume – Last 7 Days</p>
          {queriesByDay.length === 0 ? (
            <EmptyState title="No data" description="Query data will appear here." />
          ) : (
            <AreaChart data={queriesByDay} width={360} height={140}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#6B7280' }} />
              <YAxis tick={{ fontSize: 9, fill: '#6B7280' }} width={28} />
              <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1F2937', fontSize: 10 }} />
              <Area type="monotone" dataKey="count" stroke="#22C55E" fill="#22C55E33" />
            </AreaChart>
          )}
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
          <p className="mb-2 text-xs font-semibold text-slate-100">Channel Breakdown</p>
          {channelData.length === 0 ? (
            <EmptyState title="No data" description="Channel data will appear here." />
          ) : (
            <PieChart width={340} height={140}>
              <Pie data={channelData} dataKey="value" nameKey="name" cx="40%" cy="50%" outerRadius={55}>
                {channelData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1F2937', fontSize: 10 }} />
              <Legend wrapperStyle={{ fontSize: 10, color: '#9CA3AF' }} layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
          )}
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
          <p className="mb-2 text-xs font-semibold text-slate-100">Language Breakdown</p>
          {langData.length === 0 ? (
            <EmptyState title="No data" description="Language data will appear here." />
          ) : (
            <BarChart data={langData} width={360} height={140}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#6B7280' }} />
              <YAxis tick={{ fontSize: 9, fill: '#6B7280' }} width={28} />
              <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1F2937', fontSize: 10 }} />
              <Bar dataKey="value" fill="#3B82F6" radius={[3, 3, 0, 0]} />
            </BarChart>
          )}
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
          <p className="mb-2 text-xs font-semibold text-slate-100">Top Query Categories</p>
          {(s?.topQueryCategories ?? []).length === 0 ? (
            <EmptyState title="No data" description="Category data will appear here." />
          ) : (
            <BarChart layout="vertical" data={(s?.topQueryCategories ?? []).slice(0, 5)} width={360} height={140}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis type="number" tick={{ fontSize: 9, fill: '#6B7280' }} />
              <YAxis dataKey="category" type="category" width={100} tick={{ fontSize: 9, fill: '#6B7280' }} />
              <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1F2937', fontSize: 10 }} />
              <Bar dataKey="count" fill="#22C55E" radius={[0, 3, 3, 0]} />
            </BarChart>
          )}
        </div>
      </div>

      {/* Recent queries */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
        <p className="mb-2 text-xs font-semibold text-slate-100">Recent Queries</p>
        {recentQueries.isLoading && <p className="text-[11px] text-slate-400">Loading…</p>}
        {!recentQueries.isLoading && recentItems.length === 0 && (
          <EmptyState title="No queries yet" description="Recent queries will appear here." />
        )}
        {recentItems.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="pb-1.5 text-left font-medium">User</th>
                  <th className="pb-1.5 text-left font-medium">Query</th>
                  <th className="pb-1.5 text-left font-medium">Channel</th>
                  <th className="pb-1.5 text-left font-medium">Severity</th>
                  <th className="pb-1.5 text-left font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentItems.map((q) => (
                  <tr key={q.queryId}>
                    <td className="py-1.5 pr-3 font-mono text-slate-400">{q.userId.slice(-6)}</td>
                    <td className="max-w-[200px] truncate py-1.5 pr-3 text-slate-200">{q.originalText}</td>
                    <td className="py-1.5 pr-3"><ChannelBadge channel={q.channel} /></td>
                    <td className="py-1.5 pr-3">
                      {q.safetyFlags?.length > 0 ? (
                        <SeverityBadge severity="high" />
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-1.5 text-slate-500"><RelativeTime timestamp={q.timestamp} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboardPage
