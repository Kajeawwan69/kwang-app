-- โปรไฟล์ฉบับเต็ม + ระบบยศ (ไข่ด้วง -> หนอน L1-L3 -> ดักแด้ -> ตัวเต็มวัย)
-- ยศเลื่อนขึ้นตามกิจกรรมจริงในชุมชน (โพสต์ 3 แต้ม / คอมเมนต์ 1 แต้ม) คำนวณสดผ่าน view ไม่เก็บเป็นคอลัมน์
-- สายพันธุ์ที่สุ่มให้ตอนสมัคร คงที่ตลอดทุกยศ

alter table public.profiles add column page_name text;
alter table public.profiles add column line_id text;
alter table public.profiles add column facebook_url text;
alter table public.profiles add column rank_species text;
alter table public.profiles add column rank_species_th text;

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
