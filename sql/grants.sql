-- จำเป็นเพราะตอนสร้าง project ปิด "Automatically expose new tables" ไว้ (เพื่อคุมเองผ่าน RLS)
-- ตารางจึงมี RLS policy แล้วแต่ยังไม่มีสิทธิ์เข้าถึงพื้นฐานให้ role anon/authenticated
-- รันไฟล์นี้หลังสุด หลังจากรัน schema.sql, beetle_stats_schema.sql, beetle_stats_seed.sql แล้ว

grant usage on schema public to anon, authenticated;

grant select, insert, update on public.profiles to anon, authenticated;
grant select, insert, delete on public.posts to anon, authenticated;
grant select, insert, delete on public.post_likes to anon, authenticated;
grant select, insert, delete on public.post_comments to anon, authenticated;
grant select, insert on public.beetle_stats to anon, authenticated;
grant select on public.beetle_stats_ranked to anon, authenticated;
