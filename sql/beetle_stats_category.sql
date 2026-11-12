-- เพิ่มหมวดหมู่ด้วงให้กรองในหน้า Ranking ได้ (ด้วงกว่าง / คีม / ดอกไม้)
alter table public.beetle_stats add column category text;

-- ข้อมูลเดิมที่ย้ายมาจากชีต เป็นด้วงคีม (Lucanidae) ทั้งหมด
update public.beetle_stats set category = 'คีม' where category is null;

-- view ที่ใช้ select * ต้องสร้างใหม่ ไม่งั้นจะไม่เห็นคอลัมน์ที่เพิ่งเพิ่ม
create or replace view public.beetle_stats_ranked as
select *,
  rank() over (partition by species order by length_mm desc nulls last) as rank_by_length,
  rank() over (partition by species order by weight_g desc nulls last) as rank_by_weight
from public.beetle_stats;
