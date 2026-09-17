-- WebRTC Google STUN Transition: Ensure consultations table compatibility
ALTER TABLE IF EXISTS public.consultations ADD COLUMN IF NOT EXISTS agora_channel_name TEXT;
