-- 红旗车辆预约系统 · Supabase 数据库初始化
-- 在 Supabase Dashboard → SQL Editor 中运行此脚本

-- ─── bookings 表 ─────────────────────────────────────────────
create table if not exists public.bookings (
  id          uuid primary key default gen_random_uuid(),
  vehicle_id  text not null,          -- 车辆编号，如 "E202-16#"
  test_type   text not null,          -- 测试类型，如 "GE/CT"、"AS"、"稳定性"
  shift       text not null default '白班',  -- 班次：白班 / 夜班
  tester      text not null,          -- 预约人姓名
  start_date  date not null,
  end_date    date not null,
  notes       text default '',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- 更新 updated_at 触发器
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bookings_updated_at on public.bookings;
create trigger bookings_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

-- 索引
create index if not exists bookings_vehicle_id_idx on public.bookings(vehicle_id);
create index if not exists bookings_date_range_idx  on public.bookings(start_date, end_date);

-- ─── Row Level Security ───────────────────────────────────────
-- 允许所有人读写（团队内部工具，无需登录）
alter table public.bookings enable row level security;

drop policy if exists "allow_all_read"   on public.bookings;
drop policy if exists "allow_all_insert" on public.bookings;
drop policy if exists "allow_all_update" on public.bookings;
drop policy if exists "allow_all_delete" on public.bookings;

create policy "allow_all_read"
  on public.bookings for select using (true);

create policy "allow_all_insert"
  on public.bookings for insert with check (true);

create policy "allow_all_update"
  on public.bookings for update using (true) with check (true);

create policy "allow_all_delete"
  on public.bookings for delete using (true);

-- ─── 开启实时推送 ─────────────────────────────────────────────
-- 在 Supabase Dashboard → Database → Replication 中确认
-- "bookings" 表已勾选 INSERT / UPDATE / DELETE 三项。
-- 或者运行下面的命令（新版 Supabase 已默认支持）：
-- alter publication supabase_realtime add table public.bookings;
