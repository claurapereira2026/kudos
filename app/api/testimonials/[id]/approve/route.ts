import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { approved } = body

  // Verify ownership
  const { data: testimonial } = await adminClient
    .from('testimonials')
    .select('product_id')
    .eq('id', id)
    .single()

  if (!testimonial) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: product } = await adminClient
    .from('products')
    .select('user_id')
    .eq('id', testimonial.product_id)
    .single()

  if (!product || product.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await adminClient
    .from('testimonials')
    .update({ approved })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
