-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgsodium"; -- Mandatory for Vault

-- ==========================================
-- 1. IDENTITY & ACCESS MANAGEMENT
-- ==========================================

CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    kira_user_id VARCHAR(255) UNIQUE NOT NULL, -- Ties to Kira Organization object
    status VARCHAR(50) NOT NULL DEFAULT 'CREATED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- B2B Junction Table for RBAC
CREATE TABLE public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'viewer', -- roles: 'admin', 'initiator', 'viewer'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, user_id) -- User can only be added once per org
);

-- ==========================================
-- 2. COMPLIANCE & ROUTING
-- ==========================================

CREATE TABLE public.kyc_profiles (
    organization_id UUID PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'CREATED',
    verified_fields TEXT, -- Vault Encrypted TEXT (contains SSN, DOB, etc)
    raw_payload TEXT,     -- Vault Encrypted TEXT (Raw Sumsub webhook data)
    rejection_reasons JSONB,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.virtual_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    kira_va_id VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'US_BANK', 'MX_SPEI'
    mode VARCHAR(20) NOT NULL, -- 'fiat', 'crypto'
    status VARCHAR(50) NOT NULL, -- 'active', 'activating'
    source_instructions TEXT, -- Vault Encrypted (Banks routing/acct #)
    destination_wallet JSONB, -- Final default destination wallet (non-custodial)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    kira_recipient_id VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'WIRE', 'SWIFT'
    name VARCHAR(255) NOT NULL,
    bank_details TEXT, -- Vault Encrypted
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 3. CUSTODIAL INFRASTRUCTURE (VENDOR AGNOSTIC)
-- ==========================================

CREATE TABLE public.custodial_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    provider_name VARCHAR(50) NOT NULL DEFAULT 'bitgo', -- e.g., 'bitgo', 'fireblocks'
    provider_wallet_id VARCHAR(255) UNIQUE NOT NULL, -- The vendor's internal ID
    address TEXT NOT NULL, -- The actual segregated public blockchain address
    chain VARCHAR(50) NOT NULL, -- e.g., 'polygon', 'solana'
    currency VARCHAR(20) NOT NULL DEFAULT 'USDC',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 4. THE LEDGER (INBOUND & OUTBOUND)
-- ==========================================

CREATE TABLE public.deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    virtual_account_id UUID NOT NULL REFERENCES public.virtual_accounts(id),
    kira_deposit_id VARCHAR(255) UNIQUE NOT NULL,
    amount NUMERIC(20, 4) NOT NULL,
    currency VARCHAR(10) NOT NULL, -- 'USD'
    status VARCHAR(50) NOT NULL, -- 'COMPLETED', 'PENDING'
    sender_info JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    virtual_account_id UUID NOT NULL REFERENCES public.virtual_accounts(id),
    recipient_id UUID NOT NULL REFERENCES public.recipients(id),
    custodial_wallet_id UUID REFERENCES public.custodial_wallets(id), -- Maps to the custody layer
    kira_payout_id VARCHAR(255) UNIQUE NOT NULL,
    amount NUMERIC(20, 4) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'processing', 'completed'
    fees JSONB NOT NULL,
    deposit_instructions JSONB, 
    
    -- The Mathematical Split
    revenue_amount NUMERIC(20, 4), -- Your exact cut in USDC
    client_amount NUMERIC(20, 4),  -- The remainder sent to the client
    
    -- On-Chain Execution State
    on_chain_settlement_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    sweep_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'settled', 'failed'
    
    -- On-Chain Proofs
    revenue_tx_hash TEXT, -- Hash to Treasury
    client_tx_hash TEXT,  -- Hash to Client
    on_chain_error_payload JSONB,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.ledger_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id UUID NOT NULL, -- Maps to Deposit or Payout ID
    event_type VARCHAR(50) NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    event_metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 5. PERFORMANCE INDEXES 
-- ==========================================
CREATE INDEX idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX idx_va_org ON public.virtual_accounts(organization_id);
CREATE INDEX idx_recipients_org ON public.recipients(organization_id);
CREATE INDEX idx_custodial_wallets_org ON public.custodial_wallets(organization_id);
CREATE INDEX idx_deposits_org ON public.deposits(organization_id);
CREATE INDEX idx_payouts_org ON public.payouts(organization_id);
CREATE INDEX idx_payouts_revenue_tx ON public.payouts(revenue_tx_hash);
CREATE INDEX idx_payouts_client_tx ON public.payouts(client_tx_hash);
CREATE INDEX idx_ledger_ref ON public.ledger_events(reference_id);

-- ==========================================
-- 6. ENTERPRISE ROW-LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custodial_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organizations" 
ON public.organizations FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = id AND user_id = auth.uid()));

CREATE POLICY "Users can view their virtual accounts" 
ON public.virtual_accounts FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = virtual_accounts.organization_id AND user_id = auth.uid()));

CREATE POLICY "Users can view their custodial wallets" 
ON public.custodial_wallets FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = custodial_wallets.organization_id AND user_id = auth.uid()));

CREATE POLICY "Users can view their deposits" 
ON public.deposits FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = deposits.organization_id AND user_id = auth.uid()));

CREATE POLICY "Users can view their payouts" 
ON public.payouts FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = payouts.organization_id AND user_id = auth.uid()));

CREATE POLICY "Users can view own profile"
ON public.user_profiles FOR SELECT
USING (auth.uid() = id);