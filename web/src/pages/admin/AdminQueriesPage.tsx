import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listQueries } from '../../lib/api'
import { ChannelBadge } from '../../components/ChannelBadge'
import { LanguageBadge } from '../../components/LanguageBadge'
import { IntentBadge } from '../../components/IntentBadge'
import { RelativeTime } from '../../components/RelativeTime'
import { EmptyState } from '../../components/EmptyState'
import { PaginationControls } from '../../components/PaginationControls'

function AdminQueriesPage() {
  const [page, setPage] = useState(1)
  const [intent, setIntent] = useState('')
  const [channel, setChannel] = useState('')
  const [language, setLanguage] = useState('')
  const [flaggedOnly, setFlaggedOnly] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  const params = new URLSearchParams({ page: String(page), limit: '20' })
  if (intent) params.set('intent', intent)
  if (channel) params.set('channel', channel)
  if (language) params.set('language', language)
  if (flaggedOnly) params.set('flaggedOnly', 'true')

  const queries = useQuery({
    queryKey: ['admin-queries', page, intent, channel, language, flaggedOnly],
    queryFn: () => listQueries(params),
  })

  const items = queries.data?.items ?? []
  const total = queries.data?.total ?? 0

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-base font-semibold text-slate-50">Queries</h1>
        <p className="text-xs text-slate-400">{total} queries total</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-300"
          value={intent}
          onChange={(e) => { setIntent(e.target.value); setPage(1) }}
        >
          <option value="">All intents</option>
          {['health_question', 'facility_search', 'vaccination_info', 'emergency', 'general_info'].map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
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
          {['en', 'hi', 'kn', 'te'].map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-400">
          <input
            type="checkbox"
            checked={flaggedOnly}
            onChange={(e) => { setFlaggedOnly(e.target.checked); setPage(1) }}
            className="accent-red-500"
          />
          Flagged only
        </label>
      </div>

      {queries.isLoading && <p className="text-xs text-slate-400">Loading queries…</p>}
      {!queries.isLoading && items.length === 0 && (
        <EmptyState title="No queries found" description="No queries match your filters." />
      )}

      {items.length > 0 && (
        <div className="rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-[11px]">
            <thead className="border-b border-slate-800 bg-slate-900/60">
              <tr>
                {['Time', 'User', 'Query', 'Channel', 'Language', 'Intent', 'Flags'].map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-medium text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
              {items.map((q) => (
                <React.Fragment key={q.queryId}>
                  <tr
                    className="cursor-pointer hover:bg-slate-900/60"
                    onClick={() => setExpanded(expanded === q.queryId ? null : q.queryId)}
                  >
                    <td className="px-3 py-2 text-slate-400"><RelativeTime timestamp={q.timestamp} /></td>
                    <td className="px-3 py-2 font-mono text-slate-400">{q.userId.slice(-6)}</td>
                    <td className="max-w-[180px] truncate px-3 py-2 text-slate-200">{q.originalText}</td>
                    <td className="px-3 py-2"><ChannelBadge channel={q.channel} /></td>
                    <td className="px-3 py-2"><LanguageBadge language={q.language} /></td>
                    <td className="px-3 py-2"><IntentBadge intent={q.intent} /></td>
                    <td className="px-3 py-2">
                      {q.safetyFlags?.length > 0 ? (
                        <span className="text-red-400">{q.safetyFlags.length} flag{q.safetyFlags.length > 1 ? 's' : ''}</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                  {expanded === q.queryId && (
                    <tr className="bg-slate-900/80">
                      <td colSpan={7} className="px-4 py-3">
                        <div className="space-y-2 text-xs">
                          <div>
                            <p className="text-slate-500">Full Query</p>
                            <p className="mt-0.5 text-slate-200">{q.originalText}</p>
                          </div>
                          {q.responsePreview && (
                            <div>
                              <p className="text-slate-500">Response Preview</p>
                              <p className="mt-0.5 text-slate-300 line-clamp-3">{q.responsePreview}</p>
                            </div>
                          )}
                          {q.safetyFlags?.length > 0 && (
                            <div>
                              <p className="text-slate-500">Safety Flags</p>
                              <p className="mt-0.5 text-red-400">{q.safetyFlags.join(', ')}</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > 20 && (
        <PaginationControls page={page} hasMore={queries.data?.hasMore ?? false} onPageChange={setPage} />
      )}
    </div>
  )
}

export default AdminQueriesPage
