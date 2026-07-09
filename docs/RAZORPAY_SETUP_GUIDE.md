# Razorpay Setup & Integration Guide

Deploy minute-based wallet balances of LegalTalk India with India's leading payment gateway:

## 1. Sign up for a Razorpay Merchant Account
1. Visit [Razorpay Registration](https://razorpay.com/) and register business details.
2. Complete KYC procedures to shift from Test Mode to Live Mode.

## 2. Generate Razorpay API Keys
1. Access the Razorpay Dashboard and head to **Settings** > **API Keys**.
2. Make sure you are in **Test Mode** first for staging, then switch to **Live Mode** after your product launches.
3. Click **Generate Key**. Download the key file containing:
   - `Key ID` (publicly usable on frontend)
   - `Key Secret` (secure server credential)

## 3. Configure Backend Capture & Webhooks
1. In Razorpay Dashboard under **Settings**, navigate to **Webhooks**.
2. Click **Add New Webhook**. Define your API webhook listener endpoint:
   - URL: `https://your-domain.com/api/payment/webhook`
3. Check the following transaction events to track successful customer additions:
   - `payment.captured`
   - `order.paid`
4. Set a random password in `Secret` to verify signature security payload signatures securely in your backend code.

## 4. Integrate the Web client Checkouts
1. Import Razorpay's custom checkout scripts into the application layout (`<script src="https://checkout.razorpay.com/v1/checkout.js"></script>`). This provides standard visual modal checkout boxes.
2. Call `/api/payment/order` from the client side to generate a synchronized `order_id` from your node backend server.
3. Use Razorpay parameters (`key`, `amount`, `currency`, `name`, `theme`, `handler` callback) to invoke Razorpay checkout module directly inside React.
4. Catch the `razorpay_payment_id` returned and send it to your server backend `/api/payment/verify` to authorize addition to the customer's wallet balance ledger!
