'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { getInitials, sourceBadgeColor, sourceLabel } from '@/lib/utils'

interface WidgetConfig {
  columns: number
  theme: 'light' | 'dark'
  cardBg: string
  textColor: string
  mutedColor: string
  borderRadius: number
  maxCount: number
  showAvatar: boolean
  showSource: boolean
  showRole: boolean
}

interface Testimonial {
  id: string
  name: string
  role: string | null
  company: string | null
  avatar_url: string | null
  text: string
  source: string
}

const defaultConfig: WidgetConfig = {
  columns: 3,
  theme: 'light',
  cardBg: '#ffffff',
  textColor: '#111827',
  mutedColor: '#6b7280',
  borderRadius: 12,
  maxCount: 12,
  showAvatar: true,
  showSource: true,
  showRole: true,
}

export function WidgetEditor({
  productId,
  productSlug,
  widgetId,
  initialName,
  initialConfig,
  appUrl,
}: {
  productId: string
  productSlug: string
  widgetId?: string
  initialName?: string
  initialConfig?: WidgetConfig
  appUrl: string
}) {
  const [name, setName] = useState(initialName || 'My Widget')
  const [config, setConfig] = useState<WidgetConfig>(initialConfig || defaultConfig)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [saving, setSaving] = useState(false)
  const [savedSnippet, setSavedSnippet] = useState('')
  const [snippetCopied, setSnippetCopied] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchTestimonials() {
      const { data } = await supabase
        .from('testimonials')
        .select('id, name, role, company, avatar_url, text, source')
        .eq('product_id', productId)
        .eq('approved', true)
        .order('created_at', { ascending: false })
        .limit(50)
      if (data) setTestimonials(data)
    }
    fetchTestimonials()
  }, [productId]) // eslint-disable-line react-hooks/exhaustive-deps

  function setTheme(theme: 'light' | 'dark') {
    if (theme === 'dark') {
      setConfig(c => ({ ...c, theme, cardBg: '#1f2937', textColor: '#f9fafb', mutedColor: '#9ca3af' }))
    } else {
      setConfig(c => ({ ...c, theme, cardBg: '#ffffff', textColor: '#111827', mutedColor: '#6b7280' }))
    }
  }

  async function handleSave() {
    setSaving(true)
    if (widgetId) {
      await supabase.from('widgets').update({ name, config }).eq('id', widgetId)
      const snippet = `<div data-kudos-widget="${widgetId}"></div>\n<script src="${appUrl}/widget.js" async></script>`
      setSavedSnippet(snippet)
    } else {
      const { data } = await supabase
        .from('widgets')
        .insert({ product_id: productId, name, config })
        .select('id')
        .single()
      if (data) {
        const snippet = `<div data-kudos-widget="${data.id}"></div>\n<script src="${appUrl}/widget.js" async></script>`
        setSavedSnippet(snippet)
      }
    }
    setSaving(false)
  }

  function copySnippet() {
    navigator.clipboard.writeText(savedSnippet)
    setSnippetCopied(true)
    setTimeout(() => setSnippetCopied(false), 2000)
  }

  const previewTestimonials = testimonials.slice(0, config.maxCount)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Controls */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Customize</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Widget name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Columns</label>
            <div className="flex gap-2">
              {[1, 2, 3].map(n => (
                <button
                  key={n}
                  onClick={() => setConfig(c => ({ ...c, columns: n }))}
                  className={`rounded-lg px-4 py-1.5 text-sm font-medium ${
                    config.columns === n
                      ? 'bg-indigo-500 text-white'
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Theme</label>
            <div className="flex gap-2">
              {(['light', 'dark'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize ${
                    config.theme === t
                      ? 'bg-indigo-500 text-white'
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Card background</label>
              <input
                type="color"
                value={config.cardBg}
                onChange={e => setConfig(c => ({ ...c, cardBg: e.target.value }))}
                className="h-10 w-full cursor-pointer rounded-lg border border-gray-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Text color</label>
              <input
                type="color"
                value={config.textColor}
                onChange={e => setConfig(c => ({ ...c, textColor: e.target.value }))}
                className="h-10 w-full cursor-pointer rounded-lg border border-gray-200"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Border radius: {config.borderRadius}px
            </label>
            <input
              type="range"
              min={0}
              max={24}
              value={config.borderRadius}
              onChange={e => setConfig(c => ({ ...c, borderRadius: Number(e.target.value) }))}
              className="w-full"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Max testimonials</label>
            <input
              type="number"
              min={1}
              max={50}
              value={config.maxCount}
              onChange={e => setConfig(c => ({ ...c, maxCount: Number(e.target.value) }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="space-y-2">
            {([
              ['showAvatar', 'Show avatar'],
              ['showSource', 'Show source badge'],
              ['showRole', 'Show role'],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={config[key]}
                  onChange={e => setConfig(c => ({ ...c, [key]: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                {label}
              </label>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="w-full rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Widget'}
          </button>

          {savedSnippet && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="mb-2 text-xs font-medium text-gray-600">Embed code:</p>
              <pre className="mb-2 overflow-x-auto text-xs text-gray-800">{savedSnippet}</pre>
              <button
                onClick={copySnippet}
                className="rounded-lg bg-indigo-500 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-600"
              >
                {snippetCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Live Preview */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Preview</h2>
        {previewTestimonials.length === 0 ? (
          <p className="text-sm text-gray-500">No approved testimonials to preview.</p>
        ) : (
          <div
            className="gap-4"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${config.columns}, 1fr)`,
            }}
          >
            {previewTestimonials.map(t => (
              <div
                key={t.id}
                style={{
                  background: config.cardBg,
                  color: config.textColor,
                  borderRadius: `${config.borderRadius}px`,
                }}
                className="border border-gray-100 p-4"
              >
                {config.showAvatar && (
                  <div className="mb-2">
                    {t.avatar_url ? (
                      <img src={t.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium"
                        style={{ background: '#e0e7ff', color: '#4f46e5' }}
                      >
                        {getInitials(t.name)}
                      </div>
                    )}
                  </div>
                )}
                <p className="text-sm" style={{ color: config.textColor }}>{t.text}</p>
                <div className="mt-2">
                  <p className="text-sm font-medium" style={{ color: config.textColor }}>{t.name}</p>
                  {config.showRole && (t.role || t.company) && (
                    <p className="text-xs" style={{ color: config.mutedColor }}>
                      {[t.role, t.company].filter(Boolean).join(' at ')}
                    </p>
                  )}
                </div>
                {config.showSource && (
                  <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${sourceBadgeColor(t.source)}`}>
                    {sourceLabel(t.source)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
