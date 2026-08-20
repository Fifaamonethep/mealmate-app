-- ==========================================
-- ADMIN RLS POLICIES
-- Run this script in the Supabase SQL Editor
-- ==========================================

-- 1. Create a function to check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
BEGIN
  -- An admin is someone whose email is amonethep16@gmail.com OR has role 'admin' in profiles
  RETURN (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email = 'amonethep16@gmail.com')
    OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Allow admins to update ANY profile (needed for promoting/demoting users)
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (public.is_admin());

-- 3. Allow admins to delete ANY group (needed for removing spam/inactive groups)
DROP POLICY IF EXISTS "Admins can delete any group" ON public.groups;
CREATE POLICY "Admins can delete any group" ON public.groups FOR DELETE USING (public.is_admin());

-- 4. Allow admins to delete ANY profile (banning users) - Optional but good for full management
DROP POLICY IF EXISTS "Admins can delete any profile" ON public.profiles;
CREATE POLICY "Admins can delete any profile" ON public.profiles FOR DELETE USING (public.is_admin());

-- 5. Make sure admins can read all tables (usually handled by authenticated user policies, but explicit is better)
DROP POLICY IF EXISTS "Admins can view all slips" ON public.slips;
CREATE POLICY "Admins can view all slips" ON public.slips FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all slips" ON public.slips;
CREATE POLICY "Admins can update all slips" ON public.slips FOR UPDATE USING (public.is_admin());

-- Notice: 'slips' table might have existing permissive policies, this just ensures admin access.
