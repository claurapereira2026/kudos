'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { slugify } from '@/lib/utils'
import Link from 'next/link'

export default function NewProductPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const slug = slugify(name)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated'); setLoading(false); return }

    // Check slug uniqueness and append suffix if needed
    let finalSlug = slug
    let suffix = 1
    while (true) {
      const { data: existing } = await supabase
        .from('products')
        .select('id')
        .eq('slug', finalSlug)
        .maybeSingle()
      if (!existing) break
      suffix++
      finalSlug = `${slug}-${suffix}`
    }

    const { error: insertError } = await supabase
      .from('products')
      .insert({ name, slug: finalSlug, description: description || null, user_id: user.id })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
    } else {
      router.push(`/dashboard/${finalSlug}`)
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">&larr; Back to products</Link>
      </div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">New Product</h1>
      <form onSubmit={handleSubmit} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}
        <div className="mb-4">
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">Product name *</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
          {slug && <p className="mt-1 text-xs text-gray-400">Slug: {slug}</p>}
        </div>
        <div className="mb-6">
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="w-full rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Product'}
        </button>
      </form>
    </div>
  )
}
