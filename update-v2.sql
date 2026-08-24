-- ==========================================
-- MEALMATE V2 MIGRATION SCRIPT
-- Run this entire script in your Supabase SQL Editor
-- ==========================================

-- 1. Add Date and Location to Meals
ALTER TABLE public.meals 
ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS location TEXT;

-- 2. Add Note to Payments
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS note TEXT;

-- 3. Create meal_payers table for multiple payers support
CREATE TABLE IF NOT EXISTS public.meal_payers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    meal_id UUID REFERENCES public.meals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount_paid NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable RLS on meal_payers
ALTER TABLE public.meal_payers ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies for meal_payers
CREATE POLICY "Enable read access for all users" ON public.meal_payers
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.meal_payers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on user_id" ON public.meal_payers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id" ON public.meal_payers
    FOR DELETE USING (auth.uid() = user_id);

-- Create Policy for Admins to do everything on meal_payers
CREATE POLICY "Admins can do everything on meal_payers" ON public.meal_payers
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 6. Migrate existing single-payer data to meal_payers
INSERT INTO public.meal_payers (meal_id, user_id, amount_paid)
SELECT id, payer_id, total_cost
FROM public.meals
WHERE payer_id IS NOT NULL 
AND payer_type = 'single'
AND NOT EXISTS (
    SELECT 1 FROM public.meal_payers WHERE meal_payers.meal_id = meals.id
);

-- 7. Update payments status check constraint (to allow REJECTED)
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE public.payments ADD CONSTRAINT payments_status_check CHECK (status IN ('PENDING', 'COMPLETED', 'REJECTED'));
