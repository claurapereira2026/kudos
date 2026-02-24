import Link from 'next/link'

const testimonials = [
  { name: 'Sara Chen', role: 'Indie Maker', text: 'I used to lose testimonials in DMs and tweets. Kudos fixed that in about 10 minutes. Now I have a wall I\'m actually proud to link to.' },
  { name: 'Marcus Webb', role: 'Founder, Taskly', text: 'The embed widget alone is worth it. Dropped it on my landing page, instant social proof without touching my codebase.' },
  { name: 'Priya Nair', role: 'Product Designer', text: 'I was paying $49/month for a tool that did less. Kudos does everything I need and I actually own my data.' },
  { name: 'Tom Hargreaves', role: 'SaaS Builder', text: 'The Twitter import is magic. Paste a URL, done. My whole wall was up in 20 minutes flat.' },
  { name: 'Leila Ortiz', role: 'Founder, Promptly', text: 'Clean, fast, no bloat. Exactly what an indie maker needs. The Wall of Love page looks better than anything I could have built myself.' },
  { name: 'Dev Kapoor', role: 'Growth Lead', text: 'I\'ve tried 3 different testimonial tools. Kudos is the only one that doesn\'t feel like it was designed by committee.' },
]

/* ── Pricing – update this constant to change the Prime price ── */
const PRICE_PRIME = '$19'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-stone-100">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <span className='flex items-center gap-1.5'>
            <span className='text-orange-500 font-bold text-lg leading-none'>&#10077;</span>
            <span className='font-bold text-[#1a1a2e] tracking-tight'>Kudos</span>
          </span>
          <div className="flex gap-3">
            <Link href="/login" className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-stone-50">
              Sign in
            </Link>
            <Link href="/signup" className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-orange-500">Social proof, sorted</p>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-[#1a1a2e] sm:text-5xl">
          Your happy customers are your best sales team.
        </h1>
        <p className="mt-4 max-w-lg text-lg text-slate-500">
          Kudos collects testimonials from your customers, pulls them in from Twitter and Product Hunt, and helps you show them off &mdash; beautifully.
        </p>
        <div className="mt-8 flex items-center gap-4">
          <Link href="/signup" className="rounded-lg bg-orange-500 px-6 py-3 text-sm font-medium text-white hover:bg-orange-600">
            Start free
          </Link>
          <Link href="/wall/demo" className="text-sm font-medium text-slate-500 hover:text-slate-700">
            See an example &rarr;
          </Link>
        </div>
        <p className="mt-6 text-sm text-slate-400">&#10022; No subscription fees. Self-hosted. Yours forever.</p>

        <div className="mt-24">
          <h2 className="mb-10 text-center text-2xl font-bold text-[#1a1a2e]">Everything you need. Nothing you don&apos;t.</h2>
          <div className="grid max-w-3xl gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-xl">
                &#9997;&#65039;
              </div>
              <h3 className="font-semibold text-[#1a1a2e]">Gather</h3>
              <p className="mt-1 text-sm text-slate-500">A clean form your customers actually want to fill out. Shareable link, no login required.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-xl">
                &#9889;
              </div>
              <h3 className="font-semibold text-[#1a1a2e]">Import</h3>
              <p className="mt-1 text-sm text-slate-500">Paste a tweet or Product Hunt link and we pull the testimonial in. No copy-pasting.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-xl">
                &#10022;
              </div>
              <h3 className="font-semibold text-[#1a1a2e]">Showcase</h3>
              <p className="mt-1 text-sm text-slate-500">A beautiful Wall of Love page and embeddable widgets. Customise every pixel.</p>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="w-full border-t border-stone-100 py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-500">Makers love it</p>
            <h2 className="mt-2 text-3xl font-bold text-[#1a1a2e]">Don&apos;t take our word for it.</h2>
            <div className="mt-10 grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <div key={t.name} className="rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                  <span className="text-3xl text-orange-200 font-bold leading-none block mb-3">❝</span>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">{t.text}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center">
                      {t.name.split(' ').map((w) => w[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-[#1a1a2e] text-sm">{t.name}</p>
                      <p className="text-slate-400 text-xs">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="w-full border-t border-stone-100 py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-500">Pricing</p>
            <h2 className="mt-2 text-3xl font-bold text-[#1a1a2e]">Simple, honest pricing.</h2>
            <p className="mt-3 max-w-lg mx-auto text-slate-500">No per-seat fees. No usage limits hiding behind a paywall. Just two plans.</p>
            <div className="mt-10 grid max-w-3xl mx-auto gap-8 sm:grid-cols-2 items-stretch">
              {/* Free */}
              <div className="rounded-2xl border border-stone-200 bg-white p-8 flex flex-col text-left">
                <p className="text-lg font-bold text-[#1a1a2e]">Free</p>
                <div className="mt-2 flex items-baseline">
                  <span className="text-4xl font-bold text-[#1a1a2e]">$0</span>
                  <span className="text-slate-400 text-sm ml-1">/month</span>
                </div>
                <p className="mt-2 text-slate-500 text-sm">Get started, no card needed.</p>
                <ul className="mt-6 space-y-3 text-sm text-slate-600 flex-1">
                  {['1 product', 'Up to 20 testimonials', 'Wall of Love page', 'Embeddable widget', 'CSV import', 'URL import (Twitter, Product Hunt)'].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="text-orange-500 font-bold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="mt-8 block w-full rounded-xl border border-stone-200 bg-white py-2.5 text-center text-sm font-medium text-[#1a1a2e] hover:bg-stone-50">
                  Start for free
                </Link>
              </div>
              {/* Prime */}
              <div className="relative rounded-2xl bg-[#1a1a2e] p-8 flex flex-col text-left">
                <span className="absolute top-4 right-4 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">Most popular</span>
                <p className="text-lg font-bold text-white">Prime</p>
                <div className="mt-2 flex items-baseline">
                  <span className="text-4xl font-bold text-white">{PRICE_PRIME}</span>
                  <span className="text-orange-300 text-sm ml-1">/month</span>
                </div>
                <p className="mt-2 text-slate-400 text-sm">For serious makers.</p>
                <ul className="mt-6 space-y-3 text-sm text-slate-300 flex-1">
                  {['Unlimited products', 'Unlimited testimonials', 'Everything in Free', 'Priority support', 'Early access to new features'].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="text-orange-400 font-bold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="mt-8 block w-full rounded-xl bg-orange-500 py-2.5 text-center text-sm font-medium text-white hover:bg-orange-600">
                  Get Prime
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-stone-100 py-6 text-center text-sm text-slate-400">
        Made with care for indie makers. Not a VC-funded testimonial factory.
      </footer>
    </div>
  )
}
