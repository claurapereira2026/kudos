import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TestimonialsClient } from './testimonials-client'

export default async function TestimonialsPage({ params }: { params: Promise<{ slug: string }> }) {
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

  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('*')
    .eq('product_id', product.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-2">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">&larr; Back to products</Link>
      </div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/${slug}/widgets`}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            Widgets
          </Link>
          <Link
            href={`/wall/${slug}`}
            target="_blank"
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            View Wall
          </Link>
        </div>
      </div>
      <TestimonialsClient
        product={product}
        initialTestimonials={testimonials || []}
        formUrl={`${process.env.NEXT_PUBLIC_APP_URL}/form/${slug}`}
      />
    </div>
  )
}
