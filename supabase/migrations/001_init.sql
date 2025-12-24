-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- Create chat_sessions table
create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create chat_messages table
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  created_at timestamp with time zone default now()
);

-- Create indexes for performance
create index if not exists idx_chat_sessions_user_updated 
  on public.chat_sessions(user_id, updated_at desc);

create index if not exists idx_chat_messages_session_created 
  on public.chat_messages(session_id, created_at asc);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

-- RLS Policies for profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- RLS Policies for chat_sessions
create policy "Users can view own sessions"
  on public.chat_sessions for select
  using (auth.uid() = user_id);

create policy "Users can create own sessions"
  on public.chat_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sessions"
  on public.chat_sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete own sessions"
  on public.chat_sessions for delete
  using (auth.uid() = user_id);

-- RLS Policies for chat_messages
create policy "Users can view own messages"
  on public.chat_messages for select
  using (
    auth.uid() = user_id and
    exists (
      select 1 from public.chat_sessions s
      where s.id = chat_messages.session_id
        and s.user_id = auth.uid()
    )
  );

create policy "Users can insert own messages"
  on public.chat_messages for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.chat_sessions s
      where s.id = chat_messages.session_id
        and s.user_id = auth.uid()
    )
  );

create policy "Users can update own messages"
  on public.chat_messages for update
  using (
    auth.uid() = user_id and
    exists (
      select 1 from public.chat_sessions s
      where s.id = chat_messages.session_id
        and s.user_id = auth.uid()
    )
  );

create policy "Users can delete own messages"
  on public.chat_messages for delete
  using (
    auth.uid() = user_id and
    exists (
      select 1 from public.chat_sessions s
      where s.id = chat_messages.session_id
        and s.user_id = auth.uid()
    )
  );

-- Trigger function to update updated_at on chat_sessions when messages are inserted
create or replace function update_chat_session_updated_at()
returns trigger as $$
begin
  update public.chat_sessions
  set updated_at = now()
  where id = new.session_id;
  return new;
end;
$$ language plpgsql;

-- Create trigger
drop trigger if exists trigger_update_chat_session_updated_at on public.chat_messages;
create trigger trigger_update_chat_session_updated_at
  after insert on public.chat_messages
  for each row
  execute function update_chat_session_updated_at();

