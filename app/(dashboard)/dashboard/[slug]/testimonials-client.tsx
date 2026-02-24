'use client'

import { useState } from 'react'
import { getInitials, formatDate, sourceBadgeColor, sourceLabel } from '@/lib/utils'

interface Testimonial {
  id: string
  product_id: string
  name: string
  role: string | null
  company: string | null
  avatar_url: string | null
  text: string
  source: string
  source_url: string | null
  approved: boolean
  created_at: string
}

interface Product {
  id: string
  name: string
  slug: string
}

interface ImportData {
  name?: string
  role?: string
  company?: string
  avatar_url?: string
  text?: string
  source: string
  source_url: string
}

export function TestimonialsClient({
  product,
  initialTestimonials,
  formUrl,
}: {
  product: Product
  initialTestimonials: Testimonial[]
  formUrl: string
}) {
  const [testimonials, setTestimonials] = useState(initialTestimonials)
  const [tab, setTab] = useState<'pending' | 'approved'>('pending')
  const [showImport, setShowImport] = useState(false)
  const [showCsvImport, setShowCsvImport] = useState(false)
  const [copied, setCopied] = useState(false)

  const pending = testimonials.filter(t => !t.approved)
  const approved = testimonials.filter(t => t.approved)
  const displayed = tab === 'pending' ? pending : approved

  async function handleApprove(id: string, approve: boolean) {
    const res = await fetch(`/api/testimonials/${id}/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved: approve }),
    })
    if (res.ok) {
      setTestimonials(prev => prev.map(t => t.id === id ? { ...t, approved: approve } : t))
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this testimonial?')) return
    const res = await fetch(`/api/testimonials/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setTestimonials(prev => prev.filter(t => t.id !== id))
    }
  }

  function copyFormLink() {
    navigator.clipboard.writeText(formUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleImportSaved(t: Testimonial) {
    setTestimonials(prev => [t, ...prev])
    setShowImport(false)
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={copyFormLink}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
        >
          {copied ? 'Copied!' : 'Copy form link'}
        </button>
        <button
          onClick={() => setShowImport(true)}
          className="rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-600"
        >
          Import
        </button>
        <button
          onClick={() => setShowCsvImport(true)}
          className="rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-600"
        >
          Upload CSV
        </button>
      </div>

      <div className="mb-4 flex gap-1 rounded-lg bg-gray-100 p-1">
        <button
          onClick={() => setTab('pending')}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === 'pending' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Pending ({pending.length})
        </button>
        <button
          onClick={() => setTab('approved')}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === 'approved' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Approved ({approved.length})
        </button>
      </div>

      {displayed.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-12 text-center shadow-sm">
          <p className="text-gray-500">
            {tab === 'pending' ? 'No pending testimonials.' : 'No approved testimonials yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(t => (
            <div key={t.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                {t.avatar_url ? (
                  <img src={t.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-medium text-indigo-600">
                    {getInitials(t.name)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{t.name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${sourceBadgeColor(t.source)}`}>
                      {sourceLabel(t.source)}
                    </span>
                  </div>
                  {(t.role || t.company) && (
                    <p className="text-sm text-gray-500">
                      {[t.role, t.company].filter(Boolean).join(' at ')}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-700 line-clamp-3">{t.text}</p>
                  <p className="mt-1 text-xs text-gray-400">{formatDate(t.created_at)}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2 border-t border-gray-50 pt-3">
                {tab === 'pending' ? (
                  <button
                    onClick={() => handleApprove(t.id, true)}
                    className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
                  >
                    Approve
                  </button>
                ) : (
                  <button
                    onClick={() => handleApprove(t.id, false)}
                    className="rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
                  >
                    Unapprove
                  </button>
                )}
                <button
                  onClick={() => handleDelete(t.id)}
                  className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showImport && (
        <ImportModal
          productId={product.id}
          onClose={() => setShowImport(false)}
          onSaved={handleImportSaved}
        />
      )}

      {showCsvImport && (
        <CsvImportModal
          productId={product.id}
          onClose={() => setShowCsvImport(false)}
        />
      )}
    </div>
  )
}

function ImportModal({
  productId,
  onClose,
  onSaved,
}: {
  productId: string
  onClose: () => void
  onSaved: (t: Testimonial) => void
}) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [importData, setImportData] = useState<ImportData | null>(null)
  const [form, setForm] = useState({ name: '', role: '', company: '', avatar_url: '', text: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleImport(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, product_id: productId }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Import failed'); setLoading(false); return }
      setImportData(data)
      setForm({
        name: data.name || '',
        role: data.role || '',
        company: data.company || '',
        avatar_url: data.avatar_url || '',
        text: data.text || '',
      })
    } catch {
      setError('Import failed')
    }
    setLoading(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
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
          source: importData?.source || 'manual',
          source_url: importData?.source_url || url,
          approved: true,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Save failed'); setSaving(false); return }
      onSaved({
        id: data.id,
        product_id: productId,
        name: form.name,
        role: form.role || null,
        company: form.company || null,
        avatar_url: form.avatar_url || null,
        text: form.text,
        source: importData?.source || 'manual',
        source_url: importData?.source_url || url,
        approved: true,
        created_at: new Date().toISOString(),
      })
    } catch {
      setError('Save failed')
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Import Testimonial</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>
        {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        {!importData ? (
          <form onSubmit={handleImport}>
            <label className="mb-1 block text-sm font-medium text-gray-700">Paste URL</label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              required
              placeholder="https://twitter.com/..."
              className="mb-4 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50"
              >
                {loading ? 'Importing...' : 'Import'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSave} className="space-y-3">
            <p className="text-xs text-gray-500">Review and edit the imported data, then save.</p>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
                <input
                  type="text"
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Company</label>
                <input
                  type="text"
                  value={form.company}
                  onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Photo URL</label>
              <input
                type="text"
                value={form.avatar_url}
                onChange={e => setForm(f => ({ ...f, avatar_url: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Testimonial *</label>
              <textarea
                value={form.text}
                onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                required
                rows={4}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function CsvImportModal({
  productId,
  onClose,
}: {
  productId: string
  onClose: () => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null)
  const [error, setError] = useState('')

  async function handleImport() {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('product_id', productId)

      const res = await fetch('/api/import/csv', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Import failed')
        setLoading(false)
        return
      }
      setResult({ imported: data.imported, skipped: data.skipped })
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch {
      setError('Import failed')
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg" onClick={e => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Import from CSV</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
        {result && (
          <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            &#10003; {result.imported} testimonials imported{result.skipped > 0 ? `, ${result.skipped} skipped` : ''}
          </div>
        )}

        {!result && (
          <>
            <p className="mb-3 text-sm text-gray-600">
              CSV must have <span className="font-medium">name</span> and <span className="font-medium">text</span> columns. <span className="text-gray-400">role, company, avatar_url, source are optional.</span>
            </p>

            <a
              href="/sample-testimonials.csv"
              download
              className="mb-4 inline-flex items-center gap-1 text-sm text-indigo-500 hover:text-indigo-600"
            >
              &darr; Download sample CSV
            </a>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={e => setFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-indigo-600 hover:file:bg-indigo-100"
              />
              {file && <p className="mt-1 text-xs text-gray-500">Selected: {file.name}</p>}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={!file || loading}
                className="flex-1 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50"
              >
                {loading ? 'Importing...' : 'Import'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
