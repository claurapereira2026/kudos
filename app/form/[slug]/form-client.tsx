'use client'

import { useState } from 'react'

export function FormClient({ productId, productName }: { productId: string; productName: string }) {
  const [form, setForm] = useState({ name: '', role: '', company: '', avatar_url: '', text: '' })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/testimonials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: productId,
        name: form.name,
        role: form.role || null,
        company: form.company || null,
        avatar_url: form.avatar_url || null,
        text: form.text,
      }),
    })

    if (res.ok) {
      setSubmitted(true)
    } else {
      const data = await res.json()
      setError(data.error || 'Something went wrong')
    }
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-stone-100 bg-white p-8 text-center shadow-sm">
        <div className="mb-3 text-4xl">&#10022;</div>
        <h2 className="text-lg font-semibold text-[#1a1a2e]">Thank you!</h2>
        <p className="mt-1 text-sm text-slate-400">
          Your testimonial has been submitted. We really appreciate you taking the time.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-stone-100 bg-white p-6 shadow-sm">
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}
      <div className="mb-4">
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">Full name *</label>
        <input
          id="name"
          type="text"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          required
          className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
        />
      </div>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="role" className="mb-1 block text-sm font-medium text-gray-700">Role</label>
          <input
            id="role"
            type="text"
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
          />
        </div>
        <div>
          <label htmlFor="company" className="mb-1 block text-sm font-medium text-gray-700">Company</label>
          <input
            id="company"
            type="text"
            value={form.company}
            onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
          />
        </div>
      </div>
      <div className="mb-4">
        <label htmlFor="avatar" className="mb-1 block text-sm font-medium text-gray-700">Photo URL</label>
        <input
          id="avatar"
          type="url"
          value={form.avatar_url}
          onChange={e => setForm(f => ({ ...f, avatar_url: e.target.value }))}
          placeholder="https://..."
          className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
        />
      </div>
      <div className="mb-6">
        <label htmlFor="text" className="mb-1 block text-sm font-medium text-gray-700">Your testimonial *</label>
        <textarea
          id="text"
          value={form.text}
          onChange={e => setForm(f => ({ ...f, text: e.target.value.slice(0, 500) }))}
          required
          rows={4}
          maxLength={500}
          className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
        />
        <p className="mt-1 text-right text-xs text-slate-400">{form.text.length}/500</p>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Testimonial'}
      </button>
    </form>
  )
}
