create table if not exists public.user_profiles (
  user_id  uuid primary key references auth.users(id) on delete cascade,
  plan     text not null default 'free',
  updated_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

-- Users can only read their own profile
create policy "Users can read own profile"
  on public.user_profiles for select
  using (auth.uid() = user_id);

-- Service role writes via webhook (no RLS needed for service role)
