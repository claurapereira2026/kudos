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
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className='text-4xl text-orange-100 block mb-2'>&#10077;</span>
          <h1 className="text-xl font-bold text-[#1a1a2e]">How has {product.name} helped you?</h1>
          <p className="mt-1 text-sm text-slate-400">Takes about 2 minutes. Your words mean a lot to us.</p>
        </div>
        <FormClient productId={product.id} productName={product.name} />
      </div>
    </div>
  )
}
