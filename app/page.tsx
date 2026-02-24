import Link from 'next/link'

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
      </main>

      <footer className="border-t border-stone-100 py-6 text-center text-sm text-slate-400">
        Made with care for indie makers. Not a VC-funded testimonial factory.
      </footer>
    </div>
  )
}
