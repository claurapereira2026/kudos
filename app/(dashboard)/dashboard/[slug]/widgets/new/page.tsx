import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { WidgetEditor } from '../widget-editor'

export default async function NewWidgetPage({ params }: { params: Promise<{ slug: string }> }) {
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

  return (
    <div>
      <div className="mb-2">
        <Link href={`/dashboard/${slug}/widgets`} className="text-sm text-gray-500 hover:text-gray-700">&larr; Back to widgets</Link>
      </div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">New Widget</h1>
      <WidgetEditor
        productId={product.id}
        productSlug={slug}
        appUrl={process.env.NEXT_PUBLIC_APP_URL || ''}
      />
    </div>
  )
}
