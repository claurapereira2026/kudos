import { adminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { product_id, name, role, company, avatar_url, text, source, source_url, approved } = body

    if (!product_id || !name || !text) {
      return NextResponse.json({ error: 'product_id, name, and text are required' }, { status: 400 })
    }

    const { data, error } = await adminClient
      .from('testimonials')
      .insert({
        product_id,
        name,
        role: role || null,
        company: company || null,
        avatar_url: avatar_url || null,
        text,
        source: source || 'form',
        source_url: source_url || null,
        approved: approved ?? false,
      })
      .select('id')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ id: data.id }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
