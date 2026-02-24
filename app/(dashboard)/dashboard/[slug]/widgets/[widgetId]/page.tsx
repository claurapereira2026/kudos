import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { WidgetEditor } from '../widget-editor'

export default async function EditWidgetPage({ params }: { params: Promise<{ slug: string; widgetId: string }> }) {
  const { slug, widgetId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('user_id', user!.id)
    .single()

  if (!product) notFound()

  const { data: widget } = await supabase
    .from('widgets')
    .select('*')
    .eq('id', widgetId)
    .eq('product_id', product.id)
    .single()

  if (!widget) notFound()

  return (
    <div>
      <div className="mb-2">
        <Link href={`/dashboard/${slug}/widgets`} className="text-sm text-gray-500 hover:text-gray-700">&larr; Back to widgets</Link>
      </div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Edit Widget</h1>
      <WidgetEditor
        productId={product.id}
        productSlug={slug}
        widgetId={widget.id}
        initialName={widget.name}
        initialConfig={widget.config}
        appUrl={process.env.NEXT_PUBLIC_APP_URL || ''}
      />
    </div>
  )
}
