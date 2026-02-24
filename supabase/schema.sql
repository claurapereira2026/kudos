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
