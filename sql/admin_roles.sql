-- ระบบสิทธิ์ผู้ดูแล (สมาชิก / ผู้ดูแล / Admin ระบบ)
-- สำคัญ: ล็อกไม่ให้ใครแก้ role ของตัวเองตรงๆ ได้ ต้องผ่านฟังก์ชันที่เช็คว่าผู้เรียกเป็น admin จริงเท่านั้น

alter table public.profiles add column role text not null default 'member';

-- ห้ามแก้คอลัมน์ role ผ่าน update ตรงๆ (ทั้ง anon และ authenticated) — อนุญาตเฉพาะฟิลด์โปรไฟล์ทั่วไป
revoke update on public.profiles from anon, authenticated;
grant update (page_name, line_id, facebook_url, avatar_url) on public.profiles to authenticated;

-- ฟังก์ชันเปลี่ยน role: เช็คในตัวฟังก์ชันเองว่าคนเรียกต้องเป็น admin อยู่แล้วเท่านั้น
create or replace function public.set_user_role(target_id uuid, new_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role text;
begin
  select role into caller_role from public.profiles where id = auth.uid();
  if caller_role is distinct from 'admin' then
    raise exception 'ไม่มีสิทธิ์ดำเนินการ';
  end if;
  if new_role not in ('member', 'moderator', 'admin') then
    raise exception 'สิทธิ์ไม่ถูกต้อง';
  end if;
  update public.profiles set role = new_role where id = target_id;
end;
$$;

grant execute on function public.set_user_role(uuid, text) to authenticated;

-- ตั้งตัวเองเป็น Admin ระบบคนแรก (เปลี่ยน 'paradorn' เป็น username จริงของคุณถ้าไม่ตรง)
update public.profiles set role = 'admin' where username = 'paradorn';

-- view ใช้ select * ต้องสร้างใหม่ทั้งหมดอีกครั้ง ไม่งั้นจะไม่เห็นคอลัมน์ role ที่เพิ่งเพิ่ม
drop view if exists public.profile_ranks;
create view public.profile_ranks as
select
  p.*,
  coalesce(pc.n, 0) * 3 + coalesce(cc.n, 0) * 1 as points,
  case
    when coalesce(pc.n, 0) * 3 + coalesce(cc.n, 0) * 1 >= 51 then 'adult'
    when coalesce(pc.n, 0) * 3 + coalesce(cc.n, 0) * 1 >= 31 then 'pupa'
    when coalesce(pc.n, 0) * 3 + coalesce(cc.n, 0) * 1 >= 16 then 'l3'
    when coalesce(pc.n, 0) * 3 + coalesce(cc.n, 0) * 1 >= 8  then 'l2'
    when coalesce(pc.n, 0) * 3 + coalesce(cc.n, 0) * 1 >= 3  then 'l1'
    else 'egg'
  end as rank_stage
from public.profiles p
left join (select author_id, count(*) n from public.posts group by author_id) pc on pc.author_id = p.id
left join (select author_id, count(*) n from public.post_comments group by author_id) cc on cc.author_id = p.id;

grant select on public.profile_ranks to anon, authenticated;
