-- ==========================================
-- 1. RECIPIENTS OVERHAUL (THE COUNTERPARTY FORM)
-- ==========================================
-- Dropping the generic bank_details and adding your exact explicit form fields.

ALTER TABLE public.recipients DROP COLUMN IF EXISTS bank_details;

ALTER TABLE public.recipients 
    ADD COLUMN jurisdiction VARCHAR(255),
    ADD COLUMN business_registration_number VARCHAR(255),
    ADD COLUMN business_address TEXT,
    ADD COLUMN business_website VARCHAR(255),
    ADD COLUMN bank_name VARCHAR(255),
    ADD COLUMN bank_address TEXT,
    ADD COLUMN account_beneficiary_name VARCHAR(255),
    ADD COLUMN account_number VARCHAR(255), -- Stored as VARCHAR to preserve leading zeros
    ADD COLUMN routing_number VARCHAR(255), -- Stored as VARCHAR to preserve leading zeros
    ADD COLUMN swift_code VARCHAR(50),
    ADD COLUMN phone_number VARCHAR(50),
    ADD COLUMN email VARCHAR(255),
    ADD COLUMN verification_status VARCHAR(50) NOT NULL DEFAULT 'UNVERIFIED'; 

-- ==========================================
-- 2. KYC vs KYB (ENTITY TYPES) & PREFERENCES
-- ==========================================

ALTER TABLE public.organizations 
    ADD COLUMN entity_type VARCHAR(50) NOT NULL DEFAULT 'business'; -- 'business' or 'individual'

ALTER TABLE public.user_profiles 
    ADD COLUMN phone_number VARCHAR(50),
    ADD COLUMN preferences JSONB DEFAULT '{"email_alerts": true, "whatsapp_alerts": false}'::jsonb;

-- ==========================================
-- 3. THE MAKER/CHECKER WORKFLOW (Payout Approvals)
-- ==========================================

ALTER TABLE public.payouts 
    ADD COLUMN created_by UUID REFERENCES public.user_profiles(id),
    ADD COLUMN approved_by UUID REFERENCES public.user_profiles(id);

-- ==========================================
-- 4. ROBUST NOTIFICATION DELIVERIES (THE OUTBOX)
-- ==========================================

CREATE TABLE public.notification_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.notification_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    channel VARCHAR(50) NOT NULL, -- 'email', 'whatsapp', 'webhook'
    destination TEXT, -- e.g., 'alex@company.com' or '+1234567890'
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'retrying'
    attempts INT DEFAULT 0,
    last_attempt_at TIMESTAMPTZ,
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for the background workers to quickly find pending emails/messages
CREATE INDEX idx_notif_deliveries_status ON public.notification_deliveries(status) WHERE status IN ('pending', 'retrying');

-- RLS: Users can see the delivery status of their own notifications
ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own delivery status" 
ON public.notification_deliveries FOR SELECT 
USING (auth.uid() = user_id);


-- ==========================================
-- 5. SECURE COMPLIANCE STORAGE (KYC/KYB DOCS)
-- ==========================================

-- Create a PRIVATE bucket for sensitive documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'compliance_documents', 
  'compliance_documents', 
  false, -- STRICTLY FALSE: No public access
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'application/pdf']::TEXT[]
)
ON CONFLICT (id) DO UPDATE SET 
  public = false,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'application/pdf']::TEXT[];

-- RLS: Users can upload their own documents
CREATE POLICY "Users can upload their own docs" 
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'compliance_documents' AND auth.uid() = owner);

-- RLS: Users can only view/download their own documents
CREATE POLICY "Users can view their own docs" 
ON storage.objects FOR SELECT TO authenticated 
USING (bucket_id = 'compliance_documents' AND auth.uid() = owner);