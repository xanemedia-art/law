# Production Readiness Checklist

Verify these crucial system and infrastructure security parameters before going live:

## 1. Security & Keys
- [ ] **No committed secrets**: Ensure ALL API keys (Gemini, Supabase, Razorpay, Agora) are read from Environment Variables and never committed globally inside Git.
- [ ] **Check RLS Rules**: Log into Supabase dashboard and confirm that Row-Level Security (RLS) is explicitly active on ALL tables (`users`, `lawyers`, `wallets`, `consultations`, etc.).
- [ ] **Admin role locks**: Establish database server-side checks to prevent clients or lawyers from declaring themselves as administrators (`role = 'admin'`).
- [ ] **Validate user input**: Strictly enforce numeric parameters, valid email strings, secure phone number boundaries, and prevent SQL injector commands using standard query builders.

## 2. Payments & Audits
- [ ] **Razorpay signature validation**: Verify checkout payload hashes server-side on your node API routes using `RAZORPAY_KEY_SECRET` before granting user wallet increments.
- [ ] **Platform commissions**: Audit all consultation ledger inserts to confirm platform records log exact calculations (Client pays $100, lawyer receives $80, platform collects $20).
- [ ] **Continuous log stream**: Record audit lines for critical administrator actions such as blocking users, approving lawyers, or modifying database schemas.

## 3. Communication & Feeds
- [ ] **RTC token authentication**: Set up Agora dynamic dynamic authentication token channels on `/api/agora/token` so that client/lawyer audio and video streams require authenticated sessions.
- [ ] **Online switch lifecycle**: Enable client cleanup triggers so that if a lawyer disconnects or closes their browser, their availability status is set to `is_online = false`.
- [ ] **Email alerts**: Configure direct mail SMTP integrations to alert lawyers when consultation requests are received.

## 4. UI/UX Quality Checks
- [ ] **Adequate mobile scaling**: Test mobile views for 100% usability. High touch targets (minimum 44x44px buttons), dense bento-grids, and scrollable rosters.
- [ ] **Color Contrast**: Validate typography contrasts across background interfaces.
- [ ] **Fallback states**: Populate intuitive loader states and retry options if webcam authorization or network connections are slow.
- [ ] **AI Assistant Disclaimer**: Verify user guidelines show: *"This is informational guidance and not legal advice."* paired with an clear *"Talk to a verified lawyer"* escalation trigger.
