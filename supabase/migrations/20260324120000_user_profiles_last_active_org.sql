-- Active workspace (cross-device sync) — used by Next.js + setActiveWorkspace
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS last_active_organization_id uuid REFERENCES public.organizations (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS user_profiles_last_active_organization_id_idx
  ON public.user_profiles (last_active_organization_id)
  WHERE last_active_organization_id IS NOT NULL;
