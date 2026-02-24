import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url, product_id } = await request.json()
  if (!url || !product_id) {
    return NextResponse.json({ error: 'url and product_id are required' }, { status: 400 })
  }

  const hostname = new URL(url).hostname.toLowerCase()

  // Twitter / X
  if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
    try {
      const oembedRes = await fetch(
        `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=true`
      )
      if (!oembedRes.ok) throw new Error('Twitter oEmbed failed')
      const oembed = await oembedRes.json()

      // Extract text by stripping HTML tags from oembed.html
      const $ = cheerio.load(oembed.html)
      const text = $('p').first().text() || $('blockquote').text().trim()

      // Extract handle from URL for avatar
      const urlPath = new URL(url).pathname
      const handle = urlPath.split('/')[1] || ''

      return NextResponse.json({
        name: oembed.author_name || '',
        avatar_url: handle ? `https://unavatar.io/twitter/${handle}` : '',
        text,
        source: 'twitter',
        source_url: url,
      })
    } catch {
      return NextResponse.json({ source: 'twitter', source_url: url })
    }
  }

  // LinkedIn
  if (hostname.includes('linkedin.com')) {
    return NextResponse.json({ source: 'linkedin', source_url: url })
  }

  // Product Hunt
  if (hostname.includes('producthunt.com')) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Kudos/1.0)' },
      })
      const html = await res.text()
      const $ = cheerio.load(html)

      const ogTitle = $('meta[property="og:title"]').attr('content') || ''
      const ogDescription = $('meta[property="og:description"]').attr('content') || ''

      return NextResponse.json({
        name: ogTitle,
        text: ogDescription,
        source: 'producthunt',
        source_url: url,
      })
    } catch {
      return NextResponse.json({ source: 'producthunt', source_url: url })
    }
  }

  // Unknown source
  return NextResponse.json({ source: 'manual', source_url: url })
}
