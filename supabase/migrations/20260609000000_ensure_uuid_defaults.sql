-- ====================================================================
-- LEGALTALK INDIA - FIX NOT NULL CONSTRAINT ON UUID PRIMARY KEYS
-- Migration Name: 20260609000000_ensure_uuid_defaults
-- ====================================================================

-- Ensure pgcrypto and uuid-ossp extensions are active
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure all tables have DEFAULT gen_random_uuid() for primary key "id"
ALTER TABLE IF EXISTS public.users ALTER COLUMN id SET DEFAULT gen_random_uuid();
DO $$ BEGIN
    ALTER TABLE public.lawyers ALTER COLUMN id SET DEFAULT gen_random_uuid();
EXCEPTION
    WHEN undefined_column THEN NULL;
END $$;
ALTER TABLE IF EXISTS public.lawyer_documents ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE IF EXISTS public.wallet_transactions ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE IF EXISTS public.consultations ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE IF EXISTS public.consultation_messages ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE IF EXISTS public.reviews ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE IF EXISTS public.withdrawals ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE IF EXISTS public.commission_logs ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE IF EXISTS public.audit_logs ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE IF EXISTS public.admin_invitations ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE IF EXISTS public.cases ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE IF EXISTS public.notifications ALTER COLUMN id SET DEFAULT gen_random_uuid();
