-- ====================================================================
-- LEGALTALK INDIA - SUPABASE / POSTGRESQL SCHEMA MIGRATION
-- Migration Name: 20260605000000_init_legaltalk_india
-- ====================================================================

-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('client', 'lawyer', 'admin');
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE consultation_type AS ENUM ('chat', 'voice', 'video');
CREATE TYPE consultation_status AS ENUM ('requested', 'active', 'completed', 'cancelled');
CREATE TYPE transaction_type AS ENUM ('deposit', 'deduction', 'credit', 'withdrawal');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed');

-- 2. Create tables

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role user_role NOT NULL DEFAULT 'client',
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    mobile TEXT NOT NULL,
    city TEXT,
    language TEXT DEFAULT 'English',
    avatar_url TEXT,
    is_blocked BOOLEAN NOT NULL DEFAULT false,
    free_call_minutes_remaining INTEGER DEFAULT 2,
    free_chats_remaining INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Lawyers table
CREATE TABLE IF NOT EXISTS public.lawyers (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    bar_council_number TEXT UNIQUE NOT NULL,
    state_bar_council TEXT NOT NULL,
    aadhaar TEXT NOT NULL,
    pan TEXT NOT NULL,
    bio TEXT,
    experience_years INTEGER NOT NULL DEFAULT 0,
    languages TEXT[] NOT NULL DEFAULT '{}',
    categories TEXT[] NOT NULL DEFAULT '{}',
    chat_price_per_minute NUMERIC(10, 2) NOT NULL DEFAULT 10.00,
    voice_price_per_minute NUMERIC(10, 2) NOT NULL DEFAULT 15.00,
    video_price_per_minute NUMERIC(10, 2) NOT NULL DEFAULT 20.00,
    verification_status verification_status NOT NULL DEFAULT 'pending',
    is_online BOOLEAN NOT NULL DEFAULT false,
    rating NUMERIC(3, 2) DEFAULT 0.00,
    practice_state TEXT,
    practice_district TEXT,
    llb_graduation_year INTEGER,
    llb_university TEXT,
    bar_association_name TEXT,
    place_of_practice TEXT,
    enrollment_certificate_url TEXT,
    cop_url TEXT,
    llb_certificate_url TEXT,
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Lawyer Documents table
CREATE TABLE IF NOT EXISTS public.lawyer_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lawyer_id UUID NOT NULL REFERENCES public.lawyers(user_id) ON DELETE CASCADE,
    document_type TEXT NOT NULL, -- 'bar_certificate', 'aadhaar_file', 'pan_file'
    document_url TEXT NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Wallets table
CREATE TABLE IF NOT EXISTS public.wallets (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Wallet Transactions table
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES public.wallets(user_id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    type transaction_type NOT NULL,
    status transaction_status NOT NULL DEFAULT 'pending',
    description TEXT,
    reference_id TEXT, -- E.g. Razorpay order_id or payment_id
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Consultations table (Sessions)
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    lawyer_id UUID NOT NULL REFERENCES public.lawyers(user_id) ON DELETE CASCADE,
    lawyer_name TEXT NOT NULL,
    type consultation_type NOT NULL,
    status consultation_status NOT NULL DEFAULT 'requested',
    rate_per_minute NUMERIC(10, 2) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    total_minutes INTEGER,
    total_cost NUMERIC(12, 2),
    lawyer_receipt NUMERIC(12, 2),
    platform_commission NUMERIC(12, 2),
    agora_channel_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Consultation Messages (Realtime Chats)
CREATE TABLE IF NOT EXISTS public.consultation_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id),
    sender_name TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID UNIQUE NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    lawyer_id UUID NOT NULL REFERENCES public.lawyers(user_id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Withdrawals table
CREATE TABLE IF NOT EXISTS public.withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lawyer_id UUID NOT NULL REFERENCES public.lawyers(user_id) ON DELETE CASCADE,
    lawyer_name TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    bank_holder_name TEXT NOT NULL,
    bank_account_number TEXT NOT NULL,
    ifsc_code TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    approved_at TIMESTAMP WITH TIME ZONE
);

-- Commission Logs (Revenue Ledger)
CREATE TABLE IF NOT EXISTS public.commission_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID UNIQUE NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
    total_amount NUMERIC(12, 2) NOT NULL,
    lawyer_share NUMERIC(12, 2) NOT NULL,
    platform_share NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Audit Logs table (Security requirement!)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    user_email TEXT,
    action TEXT NOT NULL, -- e.g., 'VERIFY_LAWYER', 'BLOCK_USER', 'START_CONSULTATION'
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Admin Invitations table
CREATE TABLE IF NOT EXISTS public.admin_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
    is_used BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 3. Row-Level Security (RLS) Configuration

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lawyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lawyer_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_invitations ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies (Examples of essential strict rules)

-- Users Policies
CREATE POLICY "Users can view and update their own profiles."
    ON public.users FOR ALL
    USING (auth.uid() = id);

CREATE POLICY "Anyone can view approved lawyers"
    ON public.lawyers FOR SELECT
    USING (verification_status = 'approved');

-- Lawyers Policies
CREATE POLICY "Lawyers can maintain their own details"
    ON public.lawyers FOR ALL
    USING (auth.uid() = user_id);

-- Wallet Policies
CREATE POLICY "Users can only view their own wallet"
    ON public.wallets FOR SELECT
    USING (auth.uid() = user_id);

-- Consultations Policies
CREATE POLICY "Clients can view their booked consultations"
    ON public.consultations FOR SELECT
    USING (auth.uid() = client_id OR auth.uid() = lawyer_id);

-- 5. Automatically create a Wallet for newly registered users via Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.wallets (user_id, balance)
    VALUES (NEW.id, 0.00);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_wallet_on_user_signup
    AFTER INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_wallet();

-- 6. Trigger to update updated_at columns
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
CREATE TRIGGER update_lawyers_modtime BEFORE UPDATE ON public.lawyers FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
CREATE TRIGGER update_wallets_modtime BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();


-- 7. Add Essential High-Speed Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_lawyers_rating ON public.lawyers(rating DESC);
CREATE INDEX IF NOT EXISTS idx_lawyers_online ON public.lawyers(is_online) WHERE is_online = true;
CREATE INDEX IF NOT EXISTS idx_consultations_client ON public.consultations(client_id);
CREATE INDEX IF NOT EXISTS idx_consultations_lawyer ON public.consultations(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_messages_consultation ON public.consultation_messages(consultation_id);
