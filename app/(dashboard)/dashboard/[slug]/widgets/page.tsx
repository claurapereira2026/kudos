import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CopySnippet } from './copy-snippet'

export default async function WidgetsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('user_id', user!.id)
    .single()

  if (!product) notFound()

  const { data: widgets } = await supabase
    .from('widgets')
    .select('*')
    .eq('product_id', product.id)
    .order('created_at', { ascending: false })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''

  return (
    <div>
      <div className="mb-2">
        <Link href={`/dashboard/${slug}`} className="text-sm text-gray-500 hover:text-gray-700">&larr; Back to testimonials</Link>
      </div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Widgets for {product.name}</h1>
        <Link
          href={`/dashboard/${slug}/widgets/new`}
          className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
        >
          New Widget
        </Link>
      </div>

      {!widgets?.length ? (
        <div className="rounded-xl border border-gray-100 bg-white p-12 text-center shadow-sm">
          <p className="text-gray-500">No widgets yet. Create one to embed testimonials on your site.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {widgets.map((widget) => {
            const config = widget.config as { columns?: number }
            const snippet = `<div data-kudos-widget="${widget.id}"></div>\n<script src="${appUrl}/widget.js" async></script>`
            return (
              <div key={widget.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div>
                  <h3 className="font-medium text-gray-900">{widget.name}</h3>
                  <p className="text-sm text-gray-500">{config.columns || 3} columns</p>
                </div>
                <div className="flex gap-2">
                  <CopySnippet snippet={snippet} />
                  <Link
                    href={`/dashboard/${slug}/widgets/${widget.id}`}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
