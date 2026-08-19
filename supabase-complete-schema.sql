-- ==========================================
-- SUPABASE COMPLETE SCHEMA FOR MEALMATE APP
-- ==========================================

-- 1. PROFILES (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    currency TEXT DEFAULT 'LAK',
    qr_code_url TEXT,
    phone_number TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. GROUPS
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- If groups already exists, add missing columns just in case
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 3. GROUP MEMBERS
CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(group_id, user_id)
);

-- 4. FRIENDSHIPS
CREATE TABLE IF NOT EXISTS public.friendships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user1_id, user2_id)
);

-- 5. MEALS
CREATE TABLE IF NOT EXISTS public.meals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    total_cost DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'LAK',
    group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
    payer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    payer_type TEXT DEFAULT 'single',
    split_method TEXT DEFAULT 'equal',
    receipt_url TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. MEAL PARTICIPANTS
CREATE TABLE IF NOT EXISTS public.meal_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    meal_id UUID REFERENCES public.meals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    guest_name TEXT,
    amount_owed DECIMAL(12,2) NOT NULL
);

-- 7. PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    from_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    to_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    guest_name TEXT,
    amount DECIMAL(12,2) NOT NULL,
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'SLIP_SENT', 'COMPLETED'
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    related_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all profiles for friends/groups search
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Allow permissive policies for authenticated users for demo purposes
-- In a real app, you'd restrict these to group members, etc.
CREATE POLICY "Allow all authenticated users" ON public.groups FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated users" ON public.group_members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated users" ON public.friendships FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated users" ON public.meals FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated users" ON public.meal_participants FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated users" ON public.payments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated users" ON public.notifications FOR ALL USING (auth.role() = 'authenticated');

-- Trigger to create profile automatically on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Realtime Setup
-- (If you need to enable realtime, do it via the Supabase Dashboard -> Database -> Replication)
