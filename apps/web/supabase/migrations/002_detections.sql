-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)

create table if not exists detections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,  -- nullable for anonymous detections
  type text not null default 'text',                         -- text | image
  input_preview text,                                        -- first ~120 chars of text, or image filename
  verdict text not null,                                     -- ai | real
  confidence integer not null default 0,                     -- 0–100
  created_at timestamptz not null default now()
);

alter table detections enable row level security;

create policy "Users read own detections"
  on detections for select
  using (auth.uid() = user_id);

create policy "Users insert own detections"
  on detections for insert
  with check (auth.uid() = user_id or user_id is null);

create index detections_user_id_idx on detections (user_id);
create index detections_created_at_idx on detections (created_at desc);
