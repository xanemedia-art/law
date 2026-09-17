# Vercel Deployment Guide

Deploy LegalTalk India with 100% zero-cost (₹0) serverless hosting and instant Native WebRTC calling:

## 1. Vercel Architecture Overview
- **Frontend SPA**: Bundled by Vite into `dist/` and served globally at the CDN edge.
- **Serverless API**: Express router exported from `api/index.ts` and `api/[...all].ts` as native Vercel serverless functions.
- **Rewrites**: `vercel.json` routes `/api/(.*)` directly to `/api` and non-API routes to `/index.html`.
- **Database & Auth**: Supabase PostgreSQL with built-in in-memory demo account fallbacks.

---

## 2. Point Project to Vercel
1. Push all code to your repository:
   ```bash
   git push origin master
   ```
2. Log into your [Vercel Dashboard](https://vercel.com).
3. Click **Add New** > **Project** in the top right.
4. Import the `law` (or `legaltalk-india`) repository from your GitHub account.
5. Framework Preset: **Vite** (Build command: `npm run build`, Output directory: `dist`).

---

## 3. Specify Environment Variables in Vercel
Add the following key parameters in **Project Settings > Environment Variables** on Vercel:

| Variable Name | Recommended Value | Purpose |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://stgwfcanxhbqvolfpmft.supabase.co` | Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_S8g3NfVeu6JGCEiyJgYrwQ_sH4MN99S` | Client-accessible Supabase key |
| `SUPABASE_SERVICE_ROLE_KEY` | *(Your Supabase service role key)* | Privileged server-side DB operations |
| `GEMINI_API_KEY` | *(Your Google AI Studio Key)* | AI Legal Insights & Summarizer |
| `RAZORPAY_KEY_ID` | `rzp_test_yourKeyID` | Razorpay sandbox payment test ID |
| `RAZORPAY_KEY_SECRET` | `yourRazorpayKeySecret` | Razorpay test secret |
| `APP_URL` | `https://your-vercel-domain.vercel.app` | Canonical deployment URL |

> [!NOTE]
> Video and voice calling uses **Native WebRTC** via Google Public STUN servers (`stun:stun.l.google.com:19302`) with **₹0 ongoing cost** — no external paid video gateway or Agora credentials needed!

---

## 4. Pre-Seeded Demo Accounts
LegalTalk India comes with built-in automatic seeding on both Supabase and local in-memory fallback. You can log into any of these accounts immediately:

| Role | Email | Password | Default Permissions & Credits |
| :--- | :--- | :--- | :--- |
| **Client** | `client@demo.in` | `password123` | ₹500 wallet balance, 2 free call mins, 10 free chats |
| **Lawyer / Advocate** | `advocate@demo.in` | `password123` | Adv. Rajesh Kumar (Approved, 12 yrs exp, Supreme Court) |
| **Super Admin** | `admin@legaltalk.in` | `admin123` | Suresh Gupta (Full platform audit, revenue & lawyer approvals) |

---

## 5. Troubleshooting Common Vercel Errors

### 500: `Unexpected token 'A', "A server error has occurred"`
If you ever see this in the browser console:
- **Cause**: Vercel returned an HTML 500 error page because a rewrite pointed to a `.ts` file (`/api/index.ts`) instead of the serverless function route (`/api`), or the serverless function exited before Express finished.
- **Resolution**: Ensured `vercel.json` rewrites to `/api`, and `api/index.ts` exports `app` directly (`export default app`). Both are now permanently configured.
