-- ลบ Policies ทั้งหมดในตาราง group_members แบบถอนรากถอนโคน
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'group_members' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.group_members;', pol.policyname);
    END LOOP;
END
$$;

-- ลบ Policies ทั้งหมดในตาราง groups แบบถอนรากถอนโคน
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'groups' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.groups;', pol.policyname);
    END LOOP;
END
$$;

-- สร้าง Policy ใหม่ที่เรียบง่ายและไม่มีปัญหา Recursion แน่นอน
CREATE POLICY "Allow all authenticated users" ON public.groups FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated users" ON public.group_members FOR ALL USING (auth.role() = 'authenticated');
