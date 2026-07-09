# Vercel Deployment Guide

Deploy LegalTalk India with zero cold-starts or latency:

## 1. Prepare codebase structure
1. Store all code inside a git repository on your computer (e.g., git init, git add, git commit).
2. Create standard Next.js / React build rules in `vercel.json` or connect directly.
3. Push files up to a private **GitHub**, **GitLab**, or **Bitbucket** repository.

## 2. Point Project to Vercel
1. Log into your [Vercel](https://vercel.com) Dashboard.
2. Click **Add New** > **Project** in the top right.
3. Import the `legaltalk-india` repository from your linked provider.

## 3. Specify Environment Variables
Make sure to add the following key parameters from your database and gateways into the Vercel **Environment Variables** panel during setup:
- `GEMINI_API_KEY`: Key generated in Google AI Studio panel.
- `NEXT_PUBLIC_SUPABASE_URL`: Endpoint of your Supabase project.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase client-accessible key.
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase server-exclusive key.
- `RAZORPAY_KEY_ID`: Client key of Razorpay account.
- `RAZORPAY_KEY_SECRET`: Server secret of Razorpay account.
- `AGORA_APP_ID`: Application client id for Agora communication web interface.
- `APP_URL`: Set to standard deployment canonical domain (e.g. `https://legaltalkindia.vercel.app`).

## 4. Launch Build and Deploy
1. Keep default framework overrides (`Next.js` or `Vite` depending on your wrapper framework).
2. Click **Deploy**. Vercel will bundle static files, configure edge API routes, optimize images, and produce your live web app URL in ~60 seconds!
