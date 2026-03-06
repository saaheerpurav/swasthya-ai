interface Props {
  page: number
  hasMore: boolean
  onPageChange: (page: number) => void
}

export function PaginationControls({ page, hasMore, onPageChange }: Props) {
  const canPrev = page > 1
  const canNext = hasMore

  return (
    <div className="mt-3 flex items-center justify-end gap-2 text-[11px] text-slate-300">
      <button
        type="button"
        disabled={!canPrev}
        onClick={() => canPrev && onPageChange(page - 1)}
        className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>
      <span className="px-1 text-slate-400">Page {page}</span>
      <button
        type="button"
        disabled={!canNext}
        onClick={() => canNext && onPageChange(page + 1)}
        className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </div>
  )
}

