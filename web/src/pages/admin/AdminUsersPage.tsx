import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { listUsers } from '../../lib/api'
import { LanguageBadge } from '../../components/LanguageBadge'
import { ChannelBadge } from '../../components/ChannelBadge'
import { RelativeTime } from '../../components/RelativeTime'
import { EmptyState } from '../../components/EmptyState'
import { PaginationControls } from '../../components/PaginationControls'

function AdminUsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [channel, setChannel] = useState('')
  const [language, setLanguage] = useState('')

  const params = new URLSearchParams({ page: String(page), limit: '20' })
  if (search) params.set('search', search)
  if (channel) params.set('channel', channel)
  if (language) params.set('language', language)

  const users = useQuery({
    queryKey: ['admin-users', page, search, channel, language],
    queryFn: () => listUsers(params),
  })

  const items = users.data?.items ?? []
  const total = users.data?.total ?? 0

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-base font-semibold text-slate-50">Users</h1>
        <p className="text-xs text-slate-400">{total} registered users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-500" />
          <input
            className="rounded-lg border border-slate-700 bg-slate-900 pl-6 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-green-500 focus:outline-none"
            placeholder="Search phone / ID…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-300"
          value={channel}
          onChange={(e) => { setChannel(e.target.value); setPage(1) }}
        >
          <option value="">All channels</option>
          {['whatsapp', 'sms', 'web', 'mobile', 'voice'].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-300"
          value={language}
          onChange={(e) => { setLanguage(e.target.value); setPage(1) }}
        >
          <option value="">All languages</option>
          {['en', 'hi', 'kn', 'te'].map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      {users.isLoading && <p className="text-xs text-slate-400">Loading users…</p>}
      {!users.isLoading && items.length === 0 && (
        <EmptyState title="No users found" description="No users match your filters." />
      )}

      {items.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-[11px]">
            <thead className="border-b border-slate-800 bg-slate-900/60">
              <tr>
                {['User ID', 'Phone', 'Language', 'Channels', 'Queries', 'Last Active', 'Onboarded', ''].map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-medium text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
              {items.map((u) => (
                <tr key={u.userId} className="hover:bg-slate-900/60">
                  <td className="px-3 py-2 font-mono text-slate-400">{u.userId.slice(-8)}</td>
                  <td className="px-3 py-2 text-slate-300">{u.phoneNumber ?? '—'}</td>
                  <td className="px-3 py-2">
                    <LanguageBadge language={u.preferredLanguage} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {(u.channels ?? []).map((c) => <ChannelBadge key={c} channel={c} />)}
                    </div>
                  </td>
                  <td className="px-3 py-2 tabular-nums text-slate-300">{u.queryCount}</td>
                  <td className="px-3 py-2 text-slate-400">
                    <RelativeTime timestamp={u.lastActive} />
                  </td>
                  <td className="px-3 py-2">
                    <span className={u.onboardingComplete ? 'text-green-400' : 'text-slate-500'}>
                      {u.onboardingComplete ? '✓' : '—'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      to={`/admin/users/${u.userId}`}
                      className="text-green-400 hover:underline"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > 20 && (
        <PaginationControls
          page={page}
          hasMore={users.data?.hasMore ?? false}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}

export default AdminUsersPage
