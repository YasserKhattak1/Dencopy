-- Den — newsletter signups
-- Run this in the Supabase SQL Editor.
--
-- In your Next.js project, set the following in `.env.local`:
--   NEXT_PUBLIC_SUPABASE_URL      = https://YOUR-PROJECT-REF.supabase.co
--   NEXT_PUBLIC_SUPABASE_ANON_KEY = YOUR_SUPABASE_ANON_KEY

-- 1. Table -----------------------------------------------------------------

create table if not exists public.newsletter_signups (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  email       text        not null unique,
  created_at  timestamptz not null default now()
);

-- Helpful lookup index for sorting by most recent signups.
create index if not exists newsletter_signups_created_at_idx
  on public.newsletter_signups (created_at desc);

-- 2. Row Level Security ----------------------------------------------------

alter table public.newsletter_signups enable row level security;

-- Public insert policy: allow anonymous browser submissions from the
-- landing-page form. Reads / updates / deletes remain blocked by default.
drop policy if exists "Public can insert newsletter signups"
  on public.newsletter_signups;

create policy "Public can insert newsletter signups"
  on public.newsletter_signups
  for insert
  to anon, authenticated
  with check (
    length(trim(name))  between 1 and 80
    and length(trim(email)) between 3 and 254
    and email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'
  );
