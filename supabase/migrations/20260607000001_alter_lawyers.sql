-- ====================================================================
-- LEGALTALK INDIA - ALTER TABLES MIGRATION
-- Migration Name: 20260607000001_alter_lawyers
-- ====================================================================

-- 1. Alter Lawyers table to add missing columns
ALTER TABLE public.lawyers 
ADD COLUMN IF NOT EXISTS practice_state TEXT,
ADD COLUMN IF NOT EXISTS practice_district TEXT,
ADD COLUMN IF NOT EXISTS llb_graduation_year INTEGER,
ADD COLUMN IF NOT EXISTS llb_university TEXT,
ADD COLUMN IF NOT EXISTS bar_association_name TEXT,
ADD COLUMN IF NOT EXISTS place_of_practice TEXT,
ADD COLUMN IF NOT EXISTS enrollment_certificate_url TEXT,
ADD COLUMN IF NOT EXISTS cop_url TEXT,
ADD COLUMN IF NOT EXISTS llb_certificate_url TEXT,
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS review_count INTEGER NOT NULL DEFAULT 0;

-- 2. Alter Users table to add fcm_token column for push notifications
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS fcm_token TEXT;

-- 3. Force PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';
