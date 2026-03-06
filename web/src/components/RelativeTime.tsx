import { relativeTime } from '../lib/utils'

interface Props {
  timestamp: string
}

export function RelativeTime({ timestamp }: Props) {
  const label = relativeTime(timestamp)
  const title = new Date(timestamp).toLocaleString()
  return (
    <time dateTime={timestamp} title={title} className="text-[10px] text-slate-400">
      {label}
    </time>
  )
}

