import { adminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { getInitials, sourceBadgeColor, sourceLabel } from '@/lib/utils'

export default async function WallPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: product } = await adminClient
    .from('products')
    .select('id, name')
    .eq('slug', slug)
    .single()

  if (!product) notFound()

  const { data: testimonials } = await adminClient
    .from('testimonials')
    .select('*')
    .eq('product_id', product.id)
    .eq('approved', true)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-center text-3xl font-bold text-gray-900">
          What people say about {product.name}
        </h1>

        {!testimonials?.length ? (
          <p className="text-center text-gray-500">No testimonials yet.</p>
        ) : (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {testimonials.map(t => (
              <div key={t.id} className="mb-4 break-inside-avoid rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  {t.avatar_url ? (
                    <img src={t.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-medium text-indigo-600">
                      {getInitials(t.name)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{t.name}</p>
                    {(t.role || t.company) && (
                      <p className="text-sm text-gray-500">
                        {[t.role, t.company].filter(Boolean).join(' at ')}
                      </p>
                    )}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-700">{t.text}</p>
                <div className="mt-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${sourceBadgeColor(t.source)}`}>
                    {sourceLabel(t.source)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="mt-12 text-center text-xs text-gray-400">Powered by Kudos</p>
      </div>
    </div>
  )
}
