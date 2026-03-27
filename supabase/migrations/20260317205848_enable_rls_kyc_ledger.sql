-- 1. Lock down the tables
ALTER TABLE public.kyc_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_events ENABLE ROW LEVEL SECURITY;

-- 2. Grant explicit Read-Only access for KYC to valid organization members
CREATE POLICY "Users can view their organization kyc" 
ON public.kyc_profiles FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = kyc_profiles.organization_id AND user_id = auth.uid()));
