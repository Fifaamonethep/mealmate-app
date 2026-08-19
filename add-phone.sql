-- เพิ่มคอลัมน์ phone_number ลงในตาราง profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;
