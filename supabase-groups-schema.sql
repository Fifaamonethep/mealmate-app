-- Create groups table
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(group_id, user_id)
);

-- Enable RLS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Group Policies
-- Users can view groups they are members of
CREATE POLICY "Users can view their groups"
    ON public.groups FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.group_members
            WHERE group_id = public.groups.id AND user_id = auth.uid()
        )
    );

-- Any authenticated user can create a group
CREATE POLICY "Authenticated users can create groups"
    ON public.groups FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Group Members Policies
-- Users can view members of their groups
CREATE POLICY "Users can view members of their groups"
    ON public.group_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.group_members gm
            WHERE gm.group_id = public.group_members.group_id AND gm.user_id = auth.uid()
        )
        OR user_id = auth.uid()
    );

-- Users can insert members into groups (When creating a group or adding someone)
CREATE POLICY "Users can insert members"
    ON public.group_members FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');
