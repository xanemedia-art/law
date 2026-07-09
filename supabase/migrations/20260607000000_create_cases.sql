-- ====================================================================
-- LEGALTALK INDIA - SUPABASE / POSTGRESQL CASES TABLE MIGRATION
-- Migration Name: 20260607000000_create_cases
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    lawyer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    lawyer_name TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'searching', -- 'searching', 'ongoing', 'closed'
    documents JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row-Level Security
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view cases" ON public.cases FOR SELECT USING (true);
CREATE POLICY "Clients can create cases" ON public.cases FOR INSERT WITH CHECK (true);
CREATE POLICY "Clients and lawyers can update cases" ON public.cases FOR UPDATE USING (true);
