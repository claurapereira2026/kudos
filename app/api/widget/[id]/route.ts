import { adminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: widget, error } = await adminClient
    .from('widgets')
    .select('*, products(name)')
    .eq('id', id)
    .single()

  if (error || !widget) {
    return NextResponse.json({ error: 'Widget not found' }, { status: 404 })
  }

  const config = widget.config as Record<string, unknown>
  const maxCount = (config.maxCount as number) || 12

  const { data: testimonials } = await adminClient
    .from('testimonials')
    .select('id, name, role, company, avatar_url, text, source, source_url')
    .eq('product_id', widget.product_id)
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(maxCount)

  return NextResponse.json({
    config: widget.config,
    testimonials: testimonials || [],
    product: { name: (widget.products as { name: string })?.name || '' },
  })
}
