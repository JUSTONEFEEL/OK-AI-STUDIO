-- OK AI ART - Supabase 数据库初始化脚本（空状态版本）
-- 在 Supabase SQL Editor 中执行

-- 启用 pgcrypto 扩展（gen_random_uuid）
create extension if not exists "pgcrypto";

-- ============================================
-- 1. AI员工表
-- ============================================
create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  status text not null default 'offline' check (status in ('online', 'busy', 'offline')),
  description text default '',
  avatar text,
  category text default '创作',
  skills jsonb default '[]'::jsonb,
  config jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 确保所有列都存在
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='employees' and column_name='description') then
    alter table public.employees add column description text default '';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='employees' and column_name='avatar') then
    alter table public.employees add column avatar text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='employees' and column_name='category') then
    alter table public.employees add column category text default '创作';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='employees' and column_name='skills') then
    alter table public.employees add column skills jsonb default '[]'::jsonb;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='employees' and column_name='config') then
    alter table public.employees add column config jsonb default '{}'::jsonb;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='employees' and column_name='updated_at') then
    alter table public.employees add column updated_at timestamptz default now();
  end if;
end $$;

-- ============================================
-- 2. 项目表
-- ============================================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status text default '进行中',
  progress int4 default 0 check (progress >= 0 and progress <= 100),
  thumbnail text,
  description text default '',
  category text default '',
  tags jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 确保所有列都存在
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='projects' and column_name='description') then
    alter table public.projects add column description text default '';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='projects' and column_name='thumbnail') then
    alter table public.projects add column thumbnail text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='projects' and column_name='category') then
    alter table public.projects add column category text default '';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='projects' and column_name='tags') then
    alter table public.projects add column tags jsonb default '[]'::jsonb;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='projects' and column_name='updated_at') then
    alter table public.projects add column updated_at timestamptz default now();
  end if;
end $$;

-- ============================================
-- 3. 设置/配置表（存储API Key等）
-- ============================================
create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- ============================================
-- 4. 通知表
-- ============================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  type text default 'info' check (type in ('info', 'success', 'warning', 'error')),
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ============================================
-- 5. 对话记录表（AI聊天历史）
-- ============================================
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  title text default '',
  model text default 'gpt-4o',
  messages jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- 6. 生成资源表（图片/视频/音频）
-- ============================================
create table if not exists public.generated_assets (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('image', 'video', 'audio', 'document')),
  prompt text not null,
  result_url text,
  result_data jsonb default '{}'::jsonb,
  model text default '',
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  employee_id uuid references public.employees(id),
  project_id uuid references public.projects(id),
  created_at timestamptz default now()
);

-- ============================================
-- 7. 资源库表
-- ============================================
create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  url text not null,
  size int4 default 0,
  tags jsonb default '[]'::jsonb,
  description text default '',
  created_at timestamptz default now()
);

-- ============================================
-- 启用行级安全 (RLS)
-- ============================================
alter table public.employees enable row level security;
alter table public.projects enable row level security;
alter table public.settings enable row level security;
alter table public.notifications enable row level security;
alter table public.conversations enable row level security;
alter table public.generated_assets enable row level security;
alter table public.resources enable row level security;

-- ============================================
-- RLS 策略（公开读写，后续可根据需要收紧）
-- ============================================
-- Employees: 完全CRUD
create policy "Public CRUD on employees"
  on public.employees for all
  using (true) with check (true);

-- Projects: 完全CRUD
create policy "Public CRUD on projects"
  on public.projects for all
  using (true) with check (true);

-- Settings: 公开读写
create policy "Public CRUD on settings"
  on public.settings for all
  using (true) with check (true);

-- Notifications: 公开读写
create policy "Public CRUD on notifications"
  on public.notifications for all
  using (true) with check (true);

-- Conversations: 公开读写
create policy "Public CRUD on conversations"
  on public.conversations for all
  using (true) with check (true);

-- Generated Assets: 公开读写
create policy "Public CRUD on generated_assets"
  on public.generated_assets for all
  using (true) with check (true);

-- Resources: 公开读写
create policy "Public CRUD on resources"
  on public.resources for all
  using (true) with check (true);

-- ============================================
-- 初始配置数据（空状态，仅必要的系统配置）
-- ============================================
insert into public.settings (key, value) values
  ('api_config', '{"base_url": "https://zhy.lk666.ai", "api_key": "", "models": {"chat": ["gpt-4o", "claude-3.5", "gemini-2.0", "deepseek-v4"], "image": ["midjourney", "flux", "dall-e-3", "jimeng"], "video": ["sora", "runway", "vidu", "keling"], "audio": ["suno", "gemini-tts"]}}'::jsonb),
  ('theme', '{"mode": "dark", "primary_color": "#8b5cf6"}'::jsonb),
  ('site_info', '{"name": "OK AI ART", "version": "1.0.0"}'::jsonb)
on conflict (key) do nothing;

-- 不插入任何员工、项目、资源数据（完全空状态）