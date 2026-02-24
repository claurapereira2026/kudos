import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-gray-100">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <span className="text-lg font-bold text-gray-900">Kudos</span>
          <div className="flex gap-3">
            <Link href="/login" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
              Sign in
            </Link>
            <Link href="/signup" className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Collect and showcase testimonials with ease
        </h1>
        <p className="mt-4 max-w-lg text-lg text-gray-500">
          Kudos helps you collect testimonials from customers, import them from social media, and display them beautifully on your website.
        </p>
        <div className="mt-8 flex gap-4">
          <Link href="/signup" className="rounded-lg bg-indigo-500 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-600">
            Start for free
          </Link>
          <Link href="/login" className="rounded-lg border border-gray-200 px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Sign in
          </Link>
        </div>

        <div className="mt-20 grid max-w-3xl gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-xl text-indigo-500">
              &#9993;
            </div>
            <h3 className="font-semibold text-gray-900">Collect</h3>
            <p className="mt-1 text-sm text-gray-500">Public forms to gather testimonials from your customers</p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-xl text-indigo-500">
              &#8681;
            </div>
            <h3 className="font-semibold text-gray-900">Import</h3>
            <p className="mt-1 text-sm text-gray-500">Pull in testimonials from Twitter, LinkedIn, and Product Hunt</p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-xl text-indigo-500">
              &#9734;
            </div>
            <h3 className="font-semibold text-gray-900">Display</h3>
            <p className="mt-1 text-sm text-gray-500">Beautiful Wall of Love and embeddable widgets for your site</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-100 py-6 text-center text-sm text-gray-400">
        Kudos &mdash; Testimonial collection made simple
      </footer>
    </div>
  )
}
