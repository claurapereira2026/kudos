# Kudos — SPEC.md

A self-hosted testimonial collection and display app. Replaces Senja.io.

---

## Core Features

1. **Collect** — Public submission form at `/form/[slug]`
2. **Import** — Paste a Twitter/LinkedIn/Product Hunt URL to pull in a testimonial
3. **Manage** — Dashboard to approve/reject/delete testimonials per product
4. **Display** — Public Wall of Love at `/wall/[slug]`
5. **Embed** — Customizable widget that generates a `<script>` tag for embedding on any site

---

## Tech Stack

- Next.js 14 (App Router)
- Supabase (Auth + Postgres database)
- Tailwind CSS
- `@supabase/ssr` for server-side auth
- `cheerio` for HTML parsing (URL import)
- Vercel deploy

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://lcllbcpdmjcizykevmxk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=https://kudos-app.vercel.app
```

---

## Database Schema

Write this to `/supabase/schema.sql` — Louis will run it in the Supabase SQL editor.

```sql
-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Products
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz default now()
);

-- Testimonials
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade not null,
  name text not null,
  role text,
  company text,
  avatar_url text,
  text text not null,
  source text default 'form',  -- form | twitter | linkedin | producthunt | manual
  source_url text,
  approved boolean default false,
  created_at timestamptz default now()
);

-- Widgets
create table if not exists widgets (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade not null,
  name text not null,
  config jsonb default '{
    "columns": 3,
    "theme": "light",
    "cardBg": "#ffffff",
    "textColor": "#111827",
    "mutedColor": "#6b7280",
    "borderRadius": 12,
    "maxCount": 12,
    "showAvatar": true,
    "showSource": true,
    "showRole": true
  }',
  created_at timestamptz default now()
);

-- Row Level Security
alter table products enable row level security;
alter table testimonials enable row level security;
alter table widgets enable row level security;

-- Products: only owner can read/write
create policy "products_owner" on products
  for all using (auth.uid() = user_id);

-- Testimonials: owner can do everything
create policy "testimonials_owner" on testimonials
  for all using (
    product_id in (select id from products where user_id = auth.uid())
  );

-- Testimonials: public can read approved ones (for wall + widget)
create policy "testimonials_public_read" on testimonials
  for select using (approved = true);

-- Testimonials: public can insert (form submission)
create policy "testimonials_public_insert" on testimonials
  for insert with check (true);

-- Widgets: owner can do everything
create policy "widgets_owner" on widgets
  for all using (
    product_id in (select id from products where user_id = auth.uid())
  );

-- Widgets: public can read (for embed script)
create policy "widgets_public_read" on widgets
  for select using (true);
```

---

## File Structure

```
kudos/
  app/
    (auth)/
      login/page.tsx
      signup/page.tsx
    (dashboard)/
      layout.tsx              ← protected layout, redirects to /login if not authed
      dashboard/
        page.tsx              ← products list
        new/page.tsx          ← create product
        [slug]/
          page.tsx            ← testimonials list + approve/reject + import
          widgets/
            page.tsx          ← widget list
            new/page.tsx      ← create + customize widget
            [widgetId]/
              page.tsx        ← edit widget
    form/
      [slug]/page.tsx         ← public submission form
    wall/
      [slug]/page.tsx         ← public Wall of Love
    api/
      testimonials/
        route.ts              ← POST: submit testimonial (public)
        [id]/
          approve/route.ts    ← PATCH: approve/reject (authenticated)
          route.ts            ← DELETE: delete (authenticated)
      import/route.ts         ← POST: import from URL (authenticated)
      widget/[id]/route.ts    ← GET: widget data (public)
    widget.js/route.ts        ← GET: serves the embeddable JS widget script
    page.tsx                  ← landing page
    layout.tsx
    globals.css
  supabase/
    schema.sql
  lib/
    supabase/
      client.ts               ← browser client
      server.ts               ← server client (uses @supabase/ssr)
      admin.ts                ← admin client (service role, server only)
    utils.ts
  middleware.ts               ← protects /dashboard routes
```

---

## Supabase Client Setup

### lib/supabase/client.ts
```ts
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
```

### lib/supabase/server.ts
```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = async () => {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

### lib/supabase/admin.ts
```ts
import { createClient } from '@supabase/supabase-js'

export const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

### middleware.ts
```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
```

---

## Page Designs

### `/login` and `/signup`
- Clean centered card, dark or light theme
- Email + password fields
- Login: "Sign in" button + link to signup
- Signup: "Create account" button + link to login
- Use Supabase auth: `supabase.auth.signInWithPassword()` / `supabase.auth.signUp()`
- After login: redirect to `/dashboard`
- After signup: redirect to `/dashboard`

### `/dashboard` — Products list
- Header: "Kudos" logo + signout button
- "New Product" button → `/dashboard/new`
- List of product cards showing: name, slug, testimonial count, quick links (Testimonials, Widgets, Form link, Wall link)

### `/dashboard/new` — Create product
- Form: Product name (auto-generates slug from name), description (optional)
- Submit → creates product → redirects to `/dashboard/[slug]`

### `/dashboard/[slug]` — Testimonials
- Tabs: "Pending" | "Approved"
- Each testimonial card shows: avatar (or initials), name, role/company, text, source badge, date
- Action buttons: Approve / Reject (pending) | Remove approval (approved) | Delete
- "Import" button → opens a modal with URL input
  - Paste URL → hit Import → server fetches and parses, fills in testimonial details
  - If auto-parse fails (LinkedIn, blocked): show a manual fill-in form pre-populated with whatever could be extracted
- "Copy form link" button for `/form/[slug]`
- "View Wall" button for `/wall/[slug]`

### `/dashboard/[slug]/widgets` — Widget list
- List of created widgets, each showing: name, column count, a mini preview
- "New Widget" button
- Each widget has: Edit button, copy embed code button

### `/dashboard/[slug]/widgets/new` and `[widgetId]` — Widget customizer
Two-panel layout:
- **Left panel**: customization controls
  - Widget name (text input)
  - Columns: 1 / 2 / 3 buttons
  - Theme: Light / Dark toggle (sets cardBg and textColor to sensible defaults)
  - Card background color: color picker
  - Text color: color picker
  - Border radius: slider (0–24px)
  - Max testimonials: number input (1–50)
  - Toggle: Show avatar, Show source, Show role
- **Right panel**: live preview
  - Renders a grid of real testimonials using the current config
  - Updates in real-time as controls change
- Save button → saves widget config, shows embed code snippet

### `/form/[slug]` — Public submission form
- Clean, minimal, branded with product name
- Fields: Full name*, Role, Company, Photo URL (optional), Testimonial text*
- Character counter on the text field (max 500 chars)
- Submit → calls `POST /api/testimonials`
- Shows success message after submit
- No auth required

### `/wall/[slug]` — Public Wall of Love
- Full-page display of all approved testimonials for the product
- Masonry or responsive grid layout (3 columns desktop, 2 tablet, 1 mobile)
- Each card: avatar/initials, name, role/company, testimonial text, source badge (Twitter bird, LinkedIn logo, etc.)
- Header: "What people say about [product name]"
- Clean, shareable page

---

## API Routes

### POST /api/testimonials
Public. Creates a testimonial with `approved: false`.
```ts
// Body: { product_id, name, role?, company?, avatar_url?, text }
// Uses adminClient to bypass RLS for insert
```

### PATCH /api/testimonials/[id]/approve
Authenticated. Toggles approved status.
```ts
// Body: { approved: boolean }
// Verify user owns the product before updating
```

### DELETE /api/testimonials/[id]
Authenticated. Deletes a testimonial.

### POST /api/import
Authenticated. Fetches a URL and extracts testimonial data.
```ts
// Body: { url: string, product_id: string }
// Detect source from URL:
//   - twitter.com or x.com → parse tweet
//   - linkedin.com → attempt parse, likely fail gracefully
//   - producthunt.com → parse review
// Return: { name, role, company, avatar_url, text, source, source_url }
// If parse fails: return { source_url: url, source } with empty fields
// Then client shows manual fill-in form with the returned partial data
```

**Twitter/X parsing logic:**
- Fetch `https://publish.twitter.com/oembed?url={url}` — Twitter's oEmbed API is free and returns structured data
- Extract: author_name, html (parse text from it)
- For avatar: use `https://unavatar.io/twitter/{handle}` (free service)

**Product Hunt parsing:**
- Fetch the review page HTML with cheerio
- Extract reviewer name, text from meta tags or structured data

**LinkedIn:**
- Just return `{ source: 'linkedin', source_url: url }` with empty fields — LinkedIn always blocks scraping. The user fills it in manually.

### GET /api/widget/[id]
Public. Returns widget config + approved testimonials.
```ts
// Returns: { config: {...}, testimonials: [...], product: { name } }
```

### GET /widget.js
Public. Returns the embeddable JavaScript.
The script:
1. Finds all `<div data-kudos-widget="WIDGET_ID">` elements on the page
2. For each, fetches `/api/widget/[id]`
3. Renders a shadow DOM with the testimonial grid styled per the widget config
4. Injects the shadow DOM into the div

The embed code to show users:
```html
<div data-kudos-widget="WIDGET_ID"></div>
<script src="https://kudos-app.vercel.app/widget.js" async></script>
```

---

## Widget.js Script

This is served from `app/widget.js/route.ts` as `Content-Type: application/javascript`.

The script should be self-contained vanilla JS (no React, no external deps):

```js
(function() {
  async function initWidget(el) {
    const widgetId = el.getAttribute('data-kudos-widget');
    if (!widgetId) return;
    
    const res = await fetch(`${BASE_URL}/api/widget/${widgetId}`);
    const { config, testimonials } = await res.json();
    
    const shadow = el.attachShadow({ mode: 'open' });
    shadow.innerHTML = renderWidget(testimonials, config);
  }
  
  function renderWidget(testimonials, config) {
    const cols = config.columns || 3;
    const cards = testimonials.slice(0, config.maxCount || 12).map(t => renderCard(t, config)).join('');
    return `
      <style>
        /* grid styles, card styles, responsive */
        .grid { display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: 16px; }
        @media (max-width: 768px) { .grid { grid-template-columns: 1fr; } }
        .card { background: ${config.cardBg}; color: ${config.textColor}; border-radius: ${config.borderRadius}px; padding: 20px; }
        /* etc */
      </style>
      <div class="grid">${cards}</div>
    `;
  }
  
  function renderCard(t, config) { /* returns HTML string for one card */ }
  
  document.querySelectorAll('[data-kudos-widget]').forEach(initWidget);
  
  // Also watch for dynamically added elements
  new MutationObserver((mutations) => {
    mutations.forEach(m => m.addedNodes.forEach(node => {
      if (node.nodeType === 1 && node.hasAttribute?.('data-kudos-widget')) initWidget(node);
    }));
  }).observe(document.body, { childList: true, subtree: true });
})();
```

Replace `BASE_URL` with the actual deployed URL at build time.

---

## Design Style

- Clean, modern, minimal
- Color palette: white background, slate/gray text, indigo accent (`#6366f1`)
- Dashboard uses a sidebar or top nav
- Cards have subtle shadows and rounded corners
- Source badges: use SVG icons or emoji for Twitter 𝕏, LinkedIn, Product Hunt
- Responsive — works on mobile

---

## Important Constraints

- No video testimonials
- No OAuth social imports (Twitter/LinkedIn login) — URL paste only
- The `.env.local` file already exists with all keys — do NOT hardcode keys
- The `supabase/schema.sql` file must be written — it will be run manually
- Use `@supabase/ssr` for server-side Supabase (not the old `auth-helpers`)
- All API routes that modify data must verify the authenticated user owns the resource
- `adminClient` (service role) only used server-side, never exposed to client
- Do NOT use `next/headers` in client components
