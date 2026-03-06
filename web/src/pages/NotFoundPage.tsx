function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="mt-2 text-sm text-slate-400">Page not found.</p>
      <a
        href="/"
        className="mt-4 rounded-full bg-green-500 px-4 py-1.5 text-sm font-semibold text-black hover:bg-green-400"
      >
        Back to home
      </a>
    </div>
  )
}

export default NotFoundPage

