import LiveDemoWidget from '../../features/live-demo/LiveDemoWidget'
import { motion } from 'framer-motion'

const stats = [
  { value: '450M', label: 'Indians in scope' },
  { value: '4',    label: 'Languages active' },
  { value: '5',    label: 'Access channels' },
  { value: '<10s', label: 'Emergency response' },
]

const features = [
  {
    tag: 'RAG Verified',
    title: 'Zero hallucinations.',
    body: 'Every response grounded in WHO and MoHFW documents. No inference without source.',
  },
  {
    tag: 'Multilingual NLU',
    title: 'Medical vocabulary. Four languages.',
    body: 'Amazon Lex v2 understands intent in Hindi, Kannada, Telugu, and English natively.',
  },
  {
    tag: 'Emergency Detection',
    title: 'Critical symptoms. <10 seconds.',
    body: 'Comprehend Medical flags emergency patterns. Escalation triggers immediately.',
  },
  {
    tag: 'Agentic Workflow',
    title: 'Vaccine slot. <2 minutes.',
    body: 'Step Functions coordinates booking, confirmation, and reminder — end to end.',
  },
  {
    tag: 'Geospatial',
    title: 'Nearest facility. 50ms.',
    body: 'PostGIS proximity search covers hospitals, PHCs, pharmacies, and clinics.',
  },
  {
    tag: 'Outbreak Monitoring',
    title: 'Daily 6AM alerts.',
    body: 'IMD weather patterns correlated with disease data. Proactive, not reactive.',
  },
]

const channels = [
  { title: 'WhatsApp',   body: 'Send a message. Get verified guidance instantly.' },
  { title: 'SMS',        body: 'Works on any phone. No data required.' },
  { title: 'Voice',      body: 'Speak in your language. System understands.' },
  { title: 'Mobile App', body: 'Flutter app. Full feature access. Offline cache.' },
  { title: 'Web',        body: 'Browser access. No install needed.' },
]

const stack = [
  'Amazon Bedrock', 'AWS Lambda', 'DynamoDB', 'Amazon Lex',
  'Transcribe', 'Comprehend Medical', 'Amazon Polly',
  'Step Functions', 'Twilio', 'Flutter',
]

export default function LandingPage() {
  return (
    <div className="command-bg min-h-screen text-slate-50">
      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-20 border-b border-white/[0.05] bg-black/30 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-green-500 text-sm font-bold text-black brand">
              +
            </div>
            <span className="text-sm font-semibold tracking-tight">SwasthyaAI</span>
            <span className="ml-1 rounded-sm bg-green-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-green-400">
              Live
            </span>
          </div>
          <nav className="flex items-center gap-3 text-xs">
            <a href="/dashboard" className="text-slate-400 transition hover:text-slate-100">
              Dashboard
            </a>
            <a href="/admin" className="text-slate-400 transition hover:text-slate-100">
              Admin
            </a>
            <a
              href="https://d24ycx7fjjtved.cloudfront.net/swasthya-ai.apk"
              download
              className="cta cta-secondary !py-1.5 !px-3.5 !text-xs"
            >
              ↓ Download App
            </a>
            <a
              href="https://wa.me/+14155238886?text=join%20many-tool"
              target="_blank"
              rel="noreferrer"
              className="cta cta-primary !py-1.5 !px-3.5 !text-xs"
            >
              Try on WhatsApp
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-28 px-4 pb-28 pt-24">

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="mt-10 grid gap-12 md:grid-cols-2 md:items-center">
          <div className="space-y-7">
            <p className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-green-400">
              <span className="status-dot" />
              System active · AWS Hackathon 2025
            </p>

            <motion.h1
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="text-[2.6rem] leading-[1.12] tracking-tight hero-title md:text-[3.2rem]"
            >
              Verified health intelligence.<br />Any language. Any channel.
            </motion.h1>

            <p className="max-w-md text-sm leading-relaxed text-slate-400">
              Multilingual AI public health guidance for rural India.
              Voice, WhatsApp, SMS, or App — in Hindi, Kannada, Telugu, and English.
              Grounded in WHO and MoHFW sources. Zero hallucinations.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <motion.a
                href="https://wa.me/+14155238886?text=join%20many-tool"
                target="_blank"
                rel="noreferrer"
                className="cta cta-primary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                Try on WhatsApp
              </motion.a>
              <motion.a
                href="https://d24ycx7fjjtved.cloudfront.net/swasthya-ai.apk"
                download
                className="cta cta-secondary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                ↓ Download App
              </motion.a>
              <motion.a
                href="/dashboard"
                className="cta cta-ghost"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                Live Health Map
              </motion.a>
            </div>

            <div className="flex flex-wrap gap-2">
              {['English', 'हिन्दी', 'ಕನ್ನಡ', 'తెలుగు'].map((l) => (
                <span
                  key={l}
                  className="rounded-full border border-slate-700/60 bg-slate-900/50 px-3 py-1 text-[11px] font-medium text-slate-300"
                >
                  {l}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl glass-card fancy-section p-4 shadow-2xl">
            <div className="floating-blob blob-a" aria-hidden />
            <div className="floating-blob blob-b" aria-hidden />
            <LiveDemoWidget />
          </div>
        </section>

        {/* ── Signal stats ──────────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-2xl border border-green-700/20 bg-gradient-to-br from-green-950/40 via-slate-900/60 to-slate-950 px-8 py-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_0%,rgba(34,197,94,0.10),transparent_70%)]" />
          <div className="relative grid gap-6 text-center sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-extrabold tracking-tight text-white">{s.value}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-green-400/60">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Live demo ─────────────────────────────────────────────────── */}
        <section id="live-demo" className="grid gap-10 md:grid-cols-[1fr_1.1fr] md:items-start">
          <div className="space-y-3 md:pt-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-green-400">
              Live Demo
            </p>
            <h2 className="text-2xl font-semibold tracking-tight">
              System active. Query now.
            </h2>
            <p className="text-sm leading-relaxed text-slate-400">
              Submit a real health question. The system responds in under 2 seconds,
              in your language, with verified guidance.
            </p>
            <p className="text-[11px] text-slate-600">
              No login. No signup. Direct access for evaluators.
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-slate-950/80 p-4 glow-border">
            <LiveDemoWidget />
          </div>
        </section>

        {/* ── Signal flow ───────────────────────────────────────────────── */}
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Signal Flow
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Three steps. Any device.</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Input received.',
                body: 'Voice message, WhatsApp text, SMS, or app — in any supported language.',
              },
              {
                step: '02',
                title: 'Intent classified.',
                body: 'Lex detects language and intent. BioMistral-7B queries verified RAG from WHO/MoHFW.',
              },
              {
                step: '03',
                title: 'Guidance delivered.',
                body: 'Response returned with source, disclaimer, and escalation path if emergency detected.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-slate-800/60 bg-slate-950/50 p-4 glow-border"
              >
                <p className="text-[10px] font-mono font-semibold text-green-500/60">{item.step}</p>
                <h3 className="mt-2 text-sm font-semibold text-slate-100">{item.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── System capabilities ───────────────────────────────────────── */}
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            System Capabilities
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Not a chatbot. A health intelligence layer.
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {features.map((f) => (
              <motion.div
                key={f.title}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                className="rounded-2xl border border-slate-800/60 bg-gradient-to-b from-slate-900/60 to-slate-950/60 p-4 glow-border"
              >
                <p className="text-[9px] font-semibold uppercase tracking-widest text-green-400/70">
                  {f.tag}
                </p>
                <h3 className="mt-1.5 text-sm font-semibold leading-snug text-slate-100">
                  {f.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Access channels ───────────────────────────────────────────── */}
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Access Channels
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Five channels. One verified system.
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-5">
            {channels.map((c) => (
              <motion.div
                key={c.title}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                className="rounded-2xl border border-slate-800/60 bg-gradient-to-b from-slate-900/60 to-slate-950/60 p-4 glow-border"
              >
                <h3 className="text-xs font-bold tracking-wide text-slate-200">{c.title}</h3>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-400">{c.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Intelligence banner ───────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-2xl border border-slate-700/40 bg-gradient-to-r from-slate-950 via-[#050f0a] to-slate-950 px-8 py-8">
          <div className="pointer-events-none absolute inset-0 opacity-30">
            <div className="h-full w-full bg-[radial-gradient(ellipse_70%_60%_at_top,_rgba(34,197,94,0.3),_transparent_60%),radial-gradient(ellipse_50%_50%_at_bottom,_rgba(20,184,166,0.2),_transparent_60%)]" />
          </div>
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold tracking-tight">
                Real-time public health monitoring. India-wide.
              </h2>
              <p className="text-xs text-slate-400">
                Outbreak intensity map · Active alerts · Vaccination drive tracker
              </p>
            </div>
            <a
              href="/dashboard"
              className="cta cta-primary shrink-0 self-start sm:self-auto"
            >
              View Live Map →
            </a>
          </div>
        </section>

        {/* ── Stack ─────────────────────────────────────────────────────── */}
        <section className="border-t border-white/[0.05] pt-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
            Built on AWS
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {stack.map((t) => (
              <span
                key={t}
                className="rounded-full border border-slate-800/70 bg-slate-900/50 px-3 py-1 text-[10px] font-medium text-slate-400"
              >
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <footer className="border-t border-white/[0.05] pt-6 text-xs text-slate-500">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-green-500 text-[10px] font-bold text-black">+</div>
              <span className="text-xs font-semibold text-slate-400">SwasthyaAI</span>
            </div>
            <div className="flex flex-wrap gap-5">
              <a href="/dashboard" className="transition hover:text-slate-200">Dashboard</a>
              <a href="/admin" className="transition hover:text-slate-200">Admin Panel</a>
              <a href="https://wa.me/+14155238886?text=join%20many-tool" target="_blank" rel="noreferrer" className="transition hover:text-slate-200">WhatsApp</a>
            </div>
            <span className="text-[10px] text-slate-700">Neura Rangers</span>
          </div>
          <p className="mt-4 max-w-xl text-[10px] text-slate-700">
            SwasthyaAI provides health education only. Not a substitute for professional medical diagnosis or treatment. Always consult a qualified health professional.
          </p>
        </footer>
      </main>
    </div>
  )
}
