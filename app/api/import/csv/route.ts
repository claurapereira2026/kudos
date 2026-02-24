import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File
  const productId = formData.get('product_id') as string

  if (!file || !productId) {
    return NextResponse.json({ error: 'file and product_id are required' }, { status: 400 })
  }

  const text = await file.text()
  const result = Papa.parse(text, { header: true, skipEmptyLines: true })
  const rows = result.data as Record<string, string>[]

  const errors: string[] = []
  const validRows: {
    product_id: string
    name: string
    role: string | null
    company: string | null
    avatar_url: string | null
    text: string
    source: string
    approved: boolean
  }[] = []

  let skipped = 0

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const name = (row.name || '').trim()
    const rowText = (row.text || '').trim()

    if (!name || !rowText) {
      skipped++
      errors.push(`Row ${i + 1}: missing name or text`)
      continue
    }

    validRows.push({
      product_id: productId,
      name,
      role: (row.role || '').trim() || null,
      company: (row.company || '').trim() || null,
      avatar_url: (row.avatar_url || '').trim() || null,
      text: rowText,
      source: (row.source || '').trim() || 'manual',
      approved: false,
    })
  }

  if (validRows.length === 0) {
    return NextResponse.json({ imported: 0, skipped, errors })
  }

  const { error } = await adminClient
    .from('testimonials')
    .insert(validRows)

  if (error) {
    return NextResponse.json({ error: 'Database insert failed: ' + error.message }, { status: 500 })
  }

  return NextResponse.json({ imported: validRows.length, skipped, errors })
}
