-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)

create table if not exists user_devices (
  id text primary key,                           -- client-generated UUID (stored in localStorage / native keychain)
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,                            -- "Chrome on Windows", "iPhone 15", etc.
  type text not null default 'browser',          -- browser | ios | android
  circle_active boolean not null default true,   -- whether the floating circle is enabled on this device
  last_active timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table user_devices enable row level security;

create policy "Users manage own devices"
  on user_devices for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
