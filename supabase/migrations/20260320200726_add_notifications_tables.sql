-- ==========================================
-- 1. NOTIFICATION EVENTS (THE SOURCE OF TRUTH)
-- ==========================================
-- This table records that something happened in the system.
-- It is primarily written to by your Python backend.

CREATE TABLE public.notification_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    actor_user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL, -- Who triggered it? (Null if system/Kira webhook)
    reference_id UUID, -- Links directly to a payout_id, deposit_id, or kyc_id for deep data retrieval
    event_type VARCHAR(100) NOT NULL, -- e.g., 'PAYOUT_COMPLETED', 'KYB_REJECTED', 'FUNDS_RECEIVED'
    severity VARCHAR(20) NOT NULL DEFAULT 'info', -- 'info', 'warning', 'critical', 'success'
    dedupe_key VARCHAR(255), -- Prevents webhook retries from spamming the system
    payload JSONB, -- The raw data needed to build the message (e.g., {"amount": 50000, "currency": "USDC"})
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(dedupe_key) -- Database-level spam prevention
);

-- ==========================================
-- 2. NOTIFICATIONS (THE USER INBOX)
-- ==========================================
-- This is what the Next.js frontend actually queries to show the bell icon.
-- One event can create multiple notifications for different org members.

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.notification_events(id) ON DELETE CASCADE,
    
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    action_url TEXT, -- e.g., '/org-123/payouts/txn-456'
    
    -- Delivery & State Management
    delivery_channels TEXT[] DEFAULT ARRAY['in_app']::TEXT[], -- Prepares you for ['in_app', 'email', 'sms']
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    emailed_at TIMESTAMPTZ, -- Tracks if the background worker successfully sent the email
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 3. HIGH-PERFORMANCE INDEXES
-- ==========================================
-- Event lookups
CREATE INDEX idx_notif_events_org ON public.notification_events(organization_id);
CREATE INDEX idx_notif_events_ref ON public.notification_events(reference_id);

-- The "Unread Badge" Index (Critical for frontend performance when querying the bell icon count)
CREATE INDEX idx_notifications_inbox ON public.notifications(user_id, organization_id, is_read, created_at DESC);

-- ==========================================
-- 4. ENTERPRISE ROW-LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE public.notification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Frontend should never read raw events directly. They read their tailored notifications.
-- (Events are written by the Python service_role, so they need no public policies).

-- Users can ONLY see their own notifications. 
-- Even if they are an org admin, they cannot read another admin's personal notifications.
CREATE POLICY "Users can view and update their own notifications" 
ON public.notifications 
FOR ALL -- Allows SELECT (viewing) and UPDATE (marking as read)
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);