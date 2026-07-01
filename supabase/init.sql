-- OK AI ART - Supabase 数据库初始化脚本
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
  created_at timestamptz default now()
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
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='employees' and column_name='status') then
    alter table public.employees add column status text default 'offline';
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
  created_at timestamptz default now()
);

-- 确保所有列都存在（如果表之前已创建但缺字段）
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='projects' and column_name='description') then
    alter table public.projects add column description text default '';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='projects' and column_name='thumbnail') then
    alter table public.projects add column thumbnail text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='projects' and column_name='status') then
    alter table public.projects add column status text default '进行中';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='projects' and column_name='progress') then
    alter table public.projects add column progress int4 default 0;
  end if;
end $$;

-- ============================================
-- 3. 设置/配置表
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
-- 启用行级安全 (RLS)
-- ============================================
alter table public.employees enable row level security;
alter table public.projects enable row level security;
alter table public.settings enable row level security;
alter table public.notifications enable row level security;

-- ============================================
-- RLS 策略（匿名用户可读，后续可根据需要收紧）
-- ============================================
create policy "Public read access on employees"
  on public.employees for select
  using (true);

create policy "Public insert on employees"
  on public.employees for insert
  with check (true);

create policy "Public update on employees"
  on public.employees for update
  using (true);

create policy "Public delete on employees"
  on public.employees for delete
  using (true);

create policy "Public read access on projects"
  on public.projects for select
  using (true);

create policy "Public insert on projects"
  on public.projects for insert
  with check (true);

create policy "Public read access on settings"
  on public.settings for select
  using (true);

create policy "Public read access on notifications"
  on public.notifications for select
  using (true);

-- ============================================
-- 初始数据：AI员工
-- ============================================
insert into public.employees (name, role, status, description, category) values
  ('视频导演AI', '视频创作', 'online', '专业的视频导演智能助手，擅长创意策划与镜头语言设计', '创作'),
  ('角色设计AI', '角色设计', 'online', '精通各类风格角色设计，从概念到定稿一站式完成', '设计'),
  ('分镜生成AI', '分镜设计', 'busy', '快速生成专业分镜脚本，支持多种拍摄风格', '创作'),
  ('台词编剧AI', '剧本创作', 'offline', '智能剧本台词生成，适配各种题材和角色性格', '创作'),
  ('配音合成AI', '配音制作', 'online', '多语种语音合成，支持多种音色和情感表达', '制作'),
  ('后期特效AI', '后期制作', 'offline', '智能视频后期处理，自动添加特效和调色', '制作')
on conflict do nothing;

-- ============================================
-- 初始数据：项目
-- ============================================
insert into public.projects (title, status, progress, description) values
  ('品牌宣传片', '进行中', 75, '企业品牌形象宣传片项目'),
  ('产品动画', '进行中', 45, '3D产品展示动画'),
  ('短视频系列', '进行中', 90, '社交媒体短视频内容系列')
on conflict do nothing;

-- ============================================
-- 初始数据：通知
-- ============================================
insert into public.notifications (title, message, type) values
  ('系统更新', '系统已升级到最新版本，新增多项功能', 'info'),
  ('新员工上线', '后期特效AI 已加入工作区', 'success'),
  ('任务提醒', '品牌宣传片项目预计明日完成', 'warning')
on conflict do nothing;
