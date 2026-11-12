-- LIANGDUANG Community — MVP schema (รัน SQL นี้ใน Supabase SQL Editor ครั้งเดียว)
-- ขอบเขต MVP: โปรไฟล์ + โพสต์รูปภาพ + Like + Comment (ยังไม่มี follow/กลุ่ม/วิดีโอ)

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  caption text,
  image_url text not null,
  created_at timestamptz not null default now()
);

create table public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_comments enable row level security;

create policy "profiles are viewable by everyone" on public.profiles for select using (true);
create policy "users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "posts are viewable by everyone" on public.posts for select using (true);
create policy "users can insert own posts" on public.posts for insert with check (auth.uid() = author_id);
create policy "users can delete own posts" on public.posts for delete using (auth.uid() = author_id);

create policy "likes are viewable by everyone" on public.post_likes for select using (true);
create policy "users can like as themselves" on public.post_likes for insert with check (auth.uid() = user_id);
create policy "users can unlike their own like" on public.post_likes for delete using (auth.uid() = user_id);

create policy "comments are viewable by everyone" on public.post_comments for select using (true);
create policy "users can comment as themselves" on public.post_comments for insert with check (auth.uid() = author_id);
create policy "users can delete own comment" on public.post_comments for delete using (auth.uid() = author_id);

-- หลังรัน SQL นี้แล้ว ให้ไปที่ Storage ในแดชบอร์ด Supabase แล้วสร้าง bucket ชื่อ "post-images"
-- ตั้งเป็น Public bucket แล้วมารัน SQL ชุดนี้ต่อ (ต้องสร้าง bucket ก่อนจึงรันผ่าน):

create policy "post images are publicly readable"
on storage.objects for select
using (bucket_id = 'post-images');

create policy "authenticated users can upload post images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'post-images');

create policy "users can delete their own post images"
on storage.objects for delete
to authenticated
using (bucket_id = 'post-images' and owner = auth.uid());
