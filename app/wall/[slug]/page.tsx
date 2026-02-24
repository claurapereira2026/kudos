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

  const count = testimonials?.length ?? 0

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl">
        <div className="border-b border-stone-100 py-16 text-center">
          <span className='text-6xl text-orange-100 font-bold leading-none block mb-4'>&#10077;</span>
          <h1 className="text-3xl font-bold text-[#1a1a2e] sm:text-4xl">
            What people say about {product.name}
          </h1>
          <p className="mt-2 text-sm text-slate-400">{count} testimonial{count !== 1 ? 's' : ''} and counting</p>
        </div>

        {!testimonials?.length ? (
          <p className="py-16 text-center text-slate-400">No testimonials yet.</p>
        ) : (
          <div className="columns-1 gap-4 px-4 py-12 sm:columns-2 lg:columns-3">
            {testimonials.map(t => (
              <div key={t.id} className="mb-4 break-inside-avoid rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                <span className='text-2xl text-orange-200 leading-none font-bold'>&#10077;</span>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{t.text}</p>
                <div className="mt-4 flex items-center gap-3">
                  {t.avatar_url ? (
                    <img src={t.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-medium text-orange-600">
                      {getInitials(t.name)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-[#1a1a2e]">{t.name}</p>
                    {(t.role || t.company) && (
                      <p className="text-sm text-slate-400">
                        {[t.role, t.company].filter(Boolean).join(' at ')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${sourceBadgeColor(t.source)}`}>
                    {sourceLabel(t.source)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="mt-16 pb-8 text-center text-xs text-slate-300">Built with Kudos</p>
      </div>
    </div>
  )
}
