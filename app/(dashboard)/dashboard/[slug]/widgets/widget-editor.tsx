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
  widgetBg: string
  nameColor: string
  cardBorderColor: string
  showBorder: boolean
  shadow: 'none' | 'sm' | 'md' | 'lg'
  cardPadding: 'compact' | 'normal' | 'spacious'
  fontFamily: string
  bodyFontSize: 'sm' | 'md' | 'lg'
  gap: 'sm' | 'md' | 'lg'
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
  textColor: '#374151',
  mutedColor: '#9ca3af',
  borderRadius: 12,
  maxCount: 12,
  showAvatar: true,
  showSource: true,
  showRole: true,
  widgetBg: 'transparent',
  nameColor: '#111827',
  cardBorderColor: '#e5e7eb',
  showBorder: true,
  shadow: 'sm',
  cardPadding: 'normal',
  fontFamily: 'System UI',
  bodyFontSize: 'md',
  gap: 'md',
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
      setConfig(c => ({ ...c, theme, cardBg: '#1f2937', textColor: '#d1d5db', nameColor: '#f9fafb', mutedColor: '#6b7280', cardBorderColor: '#374151', widgetBg: 'transparent' }))
    } else {
      setConfig(c => ({ ...c, theme, cardBg: '#ffffff', textColor: '#374151', nameColor: '#111827', mutedColor: '#9ca3af', cardBorderColor: '#e5e7eb', widgetBg: 'transparent' }))
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

  const shadowMap: Record<string, string> = {
    none: '',
    sm: '0 1px 3px rgba(0,0,0,0.1)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.15)',
  }
  const paddingMap: Record<string, string> = { compact: '12px', normal: '20px', spacious: '32px' }
  const gapMap: Record<string, string> = { sm: '8px', md: '16px', lg: '24px' }
  const fontSizeMap: Record<string, string> = { sm: '13px', md: '15px', lg: '17px' }

  const fontUrl = config.fontFamily !== 'System UI'
    ? 'https://fonts.googleapis.com/css2?family=' + config.fontFamily.replace(/ /g, '+') + ':wght@400;600&display=swap'
    : null

  useEffect(() => {
    if (!fontUrl) return
    const existing = document.querySelector(`link[href="${fontUrl}"]`)
    if (existing) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = fontUrl
    document.head.appendChild(link)
    return () => { link.remove() }
  }, [fontUrl])

  const fontFamilyStyle = config.fontFamily !== 'System UI'
    ? `"${config.fontFamily}", system-ui, sans-serif`
    : 'system-ui, -apple-system, sans-serif'

  const sectionTitle = 'text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3'
  const sectionDivider = 'border-t border-gray-100 my-4'

  function btnGroup<T extends string>(value: T, options: { label: string; value: T }[], onChange: (v: T) => void) {
    return (
      <div className="flex gap-2">
        {options.map(o => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium ${
              value === o.value
                ? 'bg-indigo-500 text-white'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Controls */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm overflow-y-auto max-h-[85vh]">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Customize</h2>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Widget name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Section: Layout */}
        <div className={sectionDivider} />
        <p className={sectionTitle}>Layout</p>
        <div className="space-y-4">
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
            <label className="mb-1 block text-sm font-medium text-gray-700">Gap between cards</label>
            {btnGroup(config.gap, [{ label: 'Small', value: 'sm' }, { label: 'Medium', value: 'md' }, { label: 'Large', value: 'lg' }], v => setConfig(c => ({ ...c, gap: v })))}
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
        </div>

        {/* Section: Card Style */}
        <div className={sectionDivider} />
        <p className={sectionTitle}>Card Style</p>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Theme</label>
            {btnGroup(config.theme, [{ label: 'Light', value: 'light' as const }, { label: 'Dark', value: 'dark' as const }], v => setTheme(v))}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Padding</label>
            {btnGroup(config.cardPadding, [{ label: 'Compact', value: 'compact' as const }, { label: 'Normal', value: 'normal' as const }, { label: 'Spacious', value: 'spacious' as const }], v => setConfig(c => ({ ...c, cardPadding: v })))}
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
            <label className="mb-1 block text-sm font-medium text-gray-700">Shadow</label>
            {btnGroup(config.shadow, [{ label: 'None', value: 'none' as const }, { label: 'Sm', value: 'sm' as const }, { label: 'Md', value: 'md' as const }, { label: 'Lg', value: 'lg' as const }], v => setConfig(c => ({ ...c, shadow: v })))}
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={config.showBorder}
                onChange={e => setConfig(c => ({ ...c, showBorder: e.target.checked }))}
                className="rounded border-gray-300"
              />
              Show border
            </label>
          </div>
          {config.showBorder && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Card border color</label>
              <input
                type="color"
                value={config.cardBorderColor}
                onChange={e => setConfig(c => ({ ...c, cardBorderColor: e.target.value }))}
                className="h-10 w-full cursor-pointer rounded-lg border border-gray-200"
              />
            </div>
          )}
        </div>

        {/* Section: Colors */}
        <div className={sectionDivider} />
        <p className={sectionTitle}>Colors</p>
        <div className="space-y-4">
          <div>
            <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
              Widget background
              <label className="flex items-center gap-1 text-xs font-normal text-gray-500">
                <input
                  type="checkbox"
                  checked={config.widgetBg === 'transparent'}
                  onChange={e => setConfig(c => ({ ...c, widgetBg: e.target.checked ? 'transparent' : '#ffffff' }))}
                  className="rounded border-gray-300"
                />
                Transparent
              </label>
            </label>
            {config.widgetBg !== 'transparent' && (
              <input
                type="color"
                value={config.widgetBg}
                onChange={e => setConfig(c => ({ ...c, widgetBg: e.target.value }))}
                className="h-10 w-full cursor-pointer rounded-lg border border-gray-200"
              />
            )}
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
              <label className="mb-1 block text-sm font-medium text-gray-700">Name color</label>
              <input
                type="color"
                value={config.nameColor}
                onChange={e => setConfig(c => ({ ...c, nameColor: e.target.value }))}
                className="h-10 w-full cursor-pointer rounded-lg border border-gray-200"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Body text color</label>
              <input
                type="color"
                value={config.textColor}
                onChange={e => setConfig(c => ({ ...c, textColor: e.target.value }))}
                className="h-10 w-full cursor-pointer rounded-lg border border-gray-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Role / muted color</label>
              <input
                type="color"
                value={config.mutedColor}
                onChange={e => setConfig(c => ({ ...c, mutedColor: e.target.value }))}
                className="h-10 w-full cursor-pointer rounded-lg border border-gray-200"
              />
            </div>
          </div>
        </div>

        {/* Section: Typography */}
        <div className={sectionDivider} />
        <p className={sectionTitle}>Typography</p>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Font family</label>
            <select
              value={config.fontFamily}
              onChange={e => setConfig(c => ({ ...c, fontFamily: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            >
              {['System UI', 'Inter', 'DM Sans', 'Lora', 'Merriweather', 'Playfair Display', 'Nunito', 'Raleway'].map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Body text size</label>
            {btnGroup(config.bodyFontSize, [{ label: 'Small', value: 'sm' as const }, { label: 'Medium', value: 'md' as const }, { label: 'Large', value: 'lg' as const }], v => setConfig(c => ({ ...c, bodyFontSize: v })))}
          </div>
        </div>

        {/* Section: Content */}
        <div className={sectionDivider} />
        <p className={sectionTitle}>Content</p>
        <div className="space-y-2">
          {([
            ['showAvatar', 'Show avatar'],
            ['showRole', 'Show role & company'],
            ['showSource', 'Show source badge'],
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

        <div className="mt-6">
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="w-full rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Widget'}
          </button>

          {savedSnippet && (
            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
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
            style={{
              background: config.widgetBg,
              padding: '8px',
              borderRadius: '8px',
              fontFamily: fontFamilyStyle,
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${config.columns}, 1fr)`,
                gap: gapMap[config.gap] || '16px',
              }}
            >
              {previewTestimonials.map(t => (
                <div
                  key={t.id}
                  style={{
                    background: config.cardBg,
                    color: config.textColor,
                    borderRadius: `${config.borderRadius}px`,
                    padding: paddingMap[config.cardPadding] || '20px',
                    border: config.showBorder ? `1px solid ${config.cardBorderColor}` : 'none',
                    boxShadow: shadowMap[config.shadow] || '',
                    fontFamily: fontFamilyStyle,
                  }}
                >
                  {config.showAvatar && (
                    <div style={{ marginBottom: '8px' }}>
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
                  <p style={{ fontSize: fontSizeMap[config.bodyFontSize] || '15px', lineHeight: 1.5, margin: '0 0 8px 0', color: config.textColor }}>{t.text}</p>
                  <div style={{ marginTop: '8px' }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: config.nameColor }}>{t.name}</p>
                    {config.showRole && (t.role || t.company) && (
                      <p style={{ fontSize: '12px', margin: 0, color: config.mutedColor }}>
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
          </div>
        )}
      </div>
    </div>
  )
}
