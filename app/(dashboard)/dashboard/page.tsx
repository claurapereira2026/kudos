import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: products } = await supabase
    .from('products')
    .select('*, testimonials(count)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1a1a2e]">Products</h1>
        <Link
          href="/dashboard/new"
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
        >
          New Product
        </Link>
      </div>

      {!products?.length ? (
        <div className="rounded-xl border border-stone-100 bg-white p-12 text-center shadow-sm">
          <p className="text-slate-500">No products yet. Add your first one to start collecting love from your users.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const count = product.testimonials?.[0]?.count ?? 0
            return (
              <div key={product.id} className="rounded-xl border border-stone-100 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-[#1a1a2e]">{product.name}</h2>
                <p className="mt-1 text-sm text-slate-400">/{product.slug}</p>
                <div className="mt-2 flex items-center gap-1.5 text-sm">
                  {count > 0 ? (
                    <>
                      <span className="inline-block h-2 w-2 rounded-full bg-orange-400"></span>
                      <span className="text-slate-600">{count} testimonial{count !== 1 ? 's' : ''}</span>
                    </>
                  ) : (
                    <span className="text-slate-400">No testimonials yet</span>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/dashboard/${product.slug}`}
                    className="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-600 hover:bg-orange-100"
                  >
                    Testimonials
                  </Link>
                  <Link
                    href={`/dashboard/${product.slug}/widgets`}
                    className="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-600 hover:bg-orange-100"
                  >
                    Widgets
                  </Link>
                  <Link
                    href={`/form/${product.slug}`}
                    className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Form
                  </Link>
                  <Link
                    href={`/wall/${product.slug}`}
                    className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Wall
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
