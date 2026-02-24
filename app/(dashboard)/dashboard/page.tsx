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
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link
          href="/dashboard/new"
          className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
        >
          New Product
        </Link>
      </div>

      {!products?.length ? (
        <div className="rounded-xl border border-gray-100 bg-white p-12 text-center shadow-sm">
          <p className="text-gray-500">No products yet. Create your first product to start collecting testimonials.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const count = product.testimonials?.[0]?.count ?? 0
            return (
              <div key={product.id} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">{product.name}</h2>
                <p className="mt-1 text-sm text-gray-500">/{product.slug}</p>
                <p className="mt-2 text-sm text-gray-600">{count} testimonial{count !== 1 ? 's' : ''}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/dashboard/${product.slug}`}
                    className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-100"
                  >
                    Testimonials
                  </Link>
                  <Link
                    href={`/dashboard/${product.slug}/widgets`}
                    className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-100"
                  >
                    Widgets
                  </Link>
                  <Link
                    href={`/form/${product.slug}`}
                    className="rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
                  >
                    Form
                  </Link>
                  <Link
                    href={`/wall/${product.slug}`}
                    className="rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
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
