-- =============================================================================
-- 1. ADD SETTLEMENT TIMESTAMPS FOR VELOCITY/AI UNDERWRITING
-- =============================================================================
ALTER TABLE public.payouts 
ADD COLUMN settled_at TIMESTAMPTZ;

ALTER TABLE public.deposits 
ADD COLUMN settled_at TIMESTAMPTZ;

-- Create indexes for fast time-series / AI analytics queries
CREATE INDEX idx_payouts_settled_at ON public.payouts(settled_at);
CREATE INDEX idx_deposits_settled_at ON public.deposits(settled_at);

-- =============================================================================
-- 2. DOMAIN LANGUAGE ALIGNMENT: RECIPIENTS -> COUNTERPARTIES
-- =============================================================================
-- Rename the main table
ALTER TABLE public.recipients 
RENAME TO counterparties;

-- Rename the third-party reference ID to match
ALTER TABLE public.counterparties 
RENAME COLUMN kira_recipient_id TO kira_counterparty_id;

-- Rename the foreign key column in the payouts table so joins make sense
ALTER TABLE public.payouts 
RENAME COLUMN recipient_id TO counterparty_id;