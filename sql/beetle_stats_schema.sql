-- LIANGDUANG Community — Beetle World stats board (แทนที่ Google Form + Sheet เดิม)
-- รันไฟล์นี้ต่อจาก schema.sql (คนละตารางกัน ไม่ชนกัน)
-- ไม่บังคับ login ในการส่งสถิติ (ตามที่ตกลงกันไว้ — เหมือนฟอร์มเดิมที่ใครก็ส่งได้)

create table public.beetle_stats (
  id uuid primary key default gen_random_uuid(),
  species text not null,              -- ชื่อละติน เช่น "Dorcus curvidens curvidens"
  species_th text,                    -- ชื่อไทย เช่น "ด้วงคีมเคอร์วิเดนส์"
  synonym text,
  breeder_name text not null,         -- พิมพ์ชื่อเอง ไม่ผูกกับบัญชี
  generation text,                    -- F1 / CBF1 / CBF2 ...
  length_mm numeric,
  weight_g numeric,
  duration_months text,               -- เก็บเป็น text เพราะมีค่าประมาณ เช่น "~6"
  temperature text,                   -- ช่วงอุณหภูมิ เช่น "21-23"
  container text,                     -- ขนาดกระปุก อาจมีหลายช่วง เช่น "450 (L1-2), 1,400 (L3)"
  mat text,                           -- วัสดุรอง
  kinshi text,                        -- เชื้อเห็ด/ยี่ห้อ
  image_url text,                     -- รูปตัวอย่าง (อัปโหลดใหม่เท่านั้น ของเก่าไม่มีไฟล์จริงให้ย้าย)
  registration_date text,             -- เก็บ text เพราะข้อมูลเดิมรูปแบบไม่คงที่ (ปี/เดือน-ปี)
  remarks text,
  created_at timestamptz not null default now()
);

alter table public.beetle_stats enable row level security;
create policy "beetle stats are viewable by everyone" on public.beetle_stats for select using (true);
create policy "anyone can submit beetle stats" on public.beetle_stats for insert with check (true);

-- อันดับคำนวณสดทุกครั้งที่ query ไม่เก็บเลขอันดับตายตัว (ชีตเดิมพิมพ์อันดับเองซึ่งต้องไล่แก้เวลามีคนแซง)
create view public.beetle_stats_ranked as
select *,
  rank() over (partition by species order by length_mm desc nulls last) as rank_by_length,
  rank() over (partition by species order by weight_g desc nulls last) as rank_by_weight
from public.beetle_stats;
