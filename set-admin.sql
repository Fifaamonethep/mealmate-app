-- อัพเดตสิทธิ์ให้ไอดีของคุณเป็นแอดมิน (แก้ <YOUR_EMAIL> เป็นอีเมลที่ใช้ล็อกอิน)
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'amonethep16@gmail.com');

-- ถ้าค้นหาด้วยอีเมลไม่เจอ หรืออยากเซ็ตแอดมินโดยตรงผ่าน id 
-- (หา user_id ได้จากหน้า Authentication > Users)
-- UPDATE public.profiles SET role = 'admin' WHERE id = '00000000-0000-0000-0000-000000000000';
