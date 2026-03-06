import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { getUserDetail } from '../../lib/api'
import { LanguageBadge } from '../../components/LanguageBadge'
import { ChannelBadge } from '../../components/ChannelBadge'
import { IntentBadge } from '../../components/IntentBadge'
import { RelativeTime } from '../../components/RelativeTime'
import { EmptyState } from '../../components/EmptyState'

function AdminUserDetailPage() {
  const { userId } = useParams<{ userId: string }>()

  const detail = useQuery({
    queryKey: ['admin-user', userId],
    queryFn: () => getUserDetail(userId!),
    enabled: !!userId,
  })

  const d = detail.data
  const user = d?.user
  const queries = d?.queryHistory ?? []
  const vax = d?.vaccinationProfile

  if (detail.isLoading) {
    return <p className="text-xs text-slate-400">Loading user…</p>
  }

  if (!user) {
    return (
      <div className="space-y-3">
        <Link to="/admin/users" className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200">
          <ArrowLeft className="h-3 w-3" /> Back to Users
        </Link>
        <EmptyState title="User not found" description="This user does not exist." />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <Link to="/admin/users" className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200">
        <ArrowLeft className="h-3 w-3" /> Back to Users
      </Link>

      {/* Profile */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
        <h1 className="mb-3 text-sm font-semibold text-slate-50">User Profile</h1>
        <div className="grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-slate-500">User ID</p>
            <p className="mt-0.5 font-mono text-slate-200">{user.userId}</p>
          </div>
          <div>
            <p className="text-slate-500">Phone</p>
            <p className="mt-0.5 text-slate-200">{user.phoneNumber ?? '—'}</p>
          </div>
          <div>
            <p className="text-slate-500">Language</p>
            <div className="mt-0.5"><LanguageBadge language={user.preferredLanguage} /></div>
          </div>
          <div>
            <p className="text-slate-500">Channels</p>
            <div className="mt-0.5 flex flex-wrap gap-1">
              {(user.channels ?? []).map((c) => <ChannelBadge key={c} channel={c} />)}
            </div>
          </div>
          <div>
            <p className="text-slate-500">Region</p>
            <p className="mt-0.5 text-slate-200">{user.location?.regionCode ?? '—'}</p>
          </div>
          <div>
            <p className="text-slate-500">Onboarded</p>
            <p className={`mt-0.5 ${user.onboardingComplete ? 'text-green-400' : 'text-slate-500'}`}>
              {user.onboardingComplete ? 'Yes' : 'No'}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Alerts Allowed</p>
            <p className={`mt-0.5 ${user.privacySettings?.allowAlerts ? 'text-green-400' : 'text-slate-500'}`}>
              {user.privacySettings?.allowAlerts ? 'Yes' : 'No'}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Joined</p>
            <p className="mt-0.5 text-slate-200"><RelativeTime timestamp={user.createdAt} /></p>
          </div>
          <div>
            <p className="text-slate-500">Last Active</p>
            <p className="mt-0.5 text-slate-200"><RelativeTime timestamp={user.lastActive} /></p>
          </div>
        </div>
      </div>

      {/* Query history */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
        <h2 className="mb-3 text-xs font-semibold text-slate-100">Recent Queries ({queries.length})</h2>
        {queries.length === 0 ? (
          <EmptyState title="No queries" description="This user has not sent any queries yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="pb-1.5 text-left font-medium">Query</th>
                  <th className="pb-1.5 text-left font-medium">Channel</th>
                  <th className="pb-1.5 text-left font-medium">Intent</th>
                  <th className="pb-1.5 text-left font-medium">Flags</th>
                  <th className="pb-1.5 text-left font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {queries.map((q) => (
                  <tr key={q.queryId}>
                    <td className="max-w-[220px] truncate py-1.5 pr-3 text-slate-200">{q.originalText}</td>
                    <td className="py-1.5 pr-3"><ChannelBadge channel={q.channel} /></td>
                    <td className="py-1.5 pr-3"><IntentBadge intent={q.intent} /></td>
                    <td className="py-1.5 pr-3 text-slate-400">
                      {q.safetyFlags?.length ? q.safetyFlags.join(', ') : '—'}
                    </td>
                    <td className="py-1.5 text-slate-500"><RelativeTime timestamp={q.timestamp} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Vaccination profile */}
      {vax && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <h2 className="mb-3 text-xs font-semibold text-slate-100">Vaccination Profile</h2>
          <div className="grid gap-4 text-xs sm:grid-cols-2">
            <div>
              <p className="mb-1 text-slate-500">Vaccinations Received ({vax.vaccinations?.length ?? 0})</p>
              {(vax.vaccinations ?? []).length === 0 ? (
                <p className="text-slate-500">None recorded</p>
              ) : (
                <ul className="space-y-1">
                  {vax.vaccinations.map((v) => (
                    <li key={v.vaccineId} className="rounded-lg border border-slate-800 bg-slate-950/60 p-2">
                      <p className="font-semibold text-slate-200">{v.vaccineName}</p>
                      <p className="text-slate-400">{new Date(v.dateAdministered).toLocaleDateString()}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className="mb-1 text-slate-500">Upcoming Vaccines ({vax.upcomingVaccines?.length ?? 0})</p>
              {(vax.upcomingVaccines ?? []).length === 0 ? (
                <p className="text-slate-500">None scheduled</p>
              ) : (
                <ul className="space-y-1">
                  {vax.upcomingVaccines.map((v) => (
                    <li key={v.vaccineId} className="rounded-lg border border-slate-800 bg-slate-950/60 p-2">
                      <p className="font-semibold text-slate-200">{v.vaccineName}</p>
                      <p className="text-slate-400">Due: {new Date(v.dueDate).toLocaleDateString()}</p>
                      <p className={`text-[10px] ${v.priority === 'high' ? 'text-red-400' : v.priority === 'medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                        {v.priority} priority
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUserDetailPage
