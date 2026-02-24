import { adminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { FormClient } from './form-client'

export default async function FormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: product } = await adminClient
    .from('products')
    .select('id, name')
    .eq('slug', slug)
    .single()

  if (!product) notFound()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-gray-900">Share your experience with {product.name}</h1>
          <p className="mt-1 text-sm text-gray-500">We&apos;d love to hear what you think!</p>
        </div>
        <FormClient productId={product.id} productName={product.name} />
      </div>
    </div>
  )
}
