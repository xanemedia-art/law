# Supabase Setup Guide for LegalTalk India

Follow these step-by-step instructions to configure Supabase for production:

## 1. Create a Project on Supabase
1. Go to [Supabase](https://supabase.com/) and sign in with your account.
2. Click **New Project** and select your Organization.
3. Fill in the project details:
   - **Name**: `LegalTalk India`
   - **Database Password**: Generate a secure, strong password and save it safely.
   - **Region**: Highlight your target audience (e.g., `Mumbai / AP-South-1` for Indian users).
   - **Pricing Plan**: Free Tier or Pro Tier depending on your traffic load.

## 2. Execute SQL Database Migrations
1. Once your project is ready, navigate to the **SQL Editor** in the left sidebar.
2. Click **New Query** to open a fresh SQL worksheet.
3. Copy the entire contents of the `/supabase/migrations/20260605000000_init_legaltalk_india.sql` file and paste it into the query workspace.
4. Click **Run** (or `Ctrl + Enter`) to establish tables, enums, triggers, security policies, and high-speed indexes.

## 3. Grab API Credentials
1. Navigate to **Project Settings** (gear icon in left panel) > **API**.
2. Locate the following keys under **Project API Keys**:
   - `Project URL`: This is your `NEXT_PUBLIC_SUPABASE_URL`.
   - `anon public` key: This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - `service_role` key (secret, keep private): This is your `SUPABASE_SERVICE_ROLE_KEY`.

## 4. Set up Authentication
1. Go to **Authentication** (user avatar icon) > **Providers**.
2. **Email Provider**:
   - Enable **Confirm Email** if you want verification. Otherwise, toggle it off for simple test registration.
3. **Phone OTP Provider**:
   - To support **OTP Login**, enable **Phone** provider, select the SMS gateway of choice (e.g., Twilio, Msg91), and supply credentials.
4. Set **Redirect URLs** in Authentication settings to allow secure redirects to `https://legaltalkindia.vercel.app` and `http://localhost:3000`.

## 5. Enable Supabase Realtime for Chatting
1. Go to **Database** (database cylinder icon) > **Replication**.
2. Locate the `supabase_realtime` publication slot.
3. Click **Edit** and enable replication for the `consultation_messages` table to support instantaneous live client-lawyer chat messaging.
