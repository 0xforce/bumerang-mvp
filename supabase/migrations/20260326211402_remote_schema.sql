drop extension if exists "pg_net";

drop index if exists "public"."user_profiles_last_active_organization_id_idx";


  create table "public"."organization_billing" (
    "organization_id" uuid not null,
    "stripe_customer_id" character varying(255),
    "stripe_payment_method_id" character varying(255),
    "fee_rate_bps" integer not null default 150,
    "min_monthly_volume_usd" numeric(20,4) not null default 0.0000,
    "billing_status" character varying(50) not null default 'active'::character varying,
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."organization_billing" enable row level security;


  create table "public"."organization_invites" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "email" character varying(255) not null,
    "role" character varying(50) not null default 'preparer'::character varying,
    "invited_by" uuid,
    "status" character varying(50) not null default 'pending'::character varying,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."organization_invites" enable row level security;

alter table "public"."kyc_profiles" add column "public_metadata" jsonb default '{}'::jsonb;

alter table "public"."organizations" alter column "kira_user_id" drop not null;

alter table "public"."user_profiles" add column "system_role" character varying(50) default NULL::character varying;

CREATE UNIQUE INDEX organization_billing_pkey ON public.organization_billing USING btree (organization_id);

CREATE UNIQUE INDEX organization_billing_stripe_customer_id_key ON public.organization_billing USING btree (stripe_customer_id);

CREATE UNIQUE INDEX organization_invites_organization_id_email_key ON public.organization_invites USING btree (organization_id, email);

CREATE UNIQUE INDEX organization_invites_pkey ON public.organization_invites USING btree (id);

alter table "public"."organization_billing" add constraint "organization_billing_pkey" PRIMARY KEY using index "organization_billing_pkey";

alter table "public"."organization_invites" add constraint "organization_invites_pkey" PRIMARY KEY using index "organization_invites_pkey";

alter table "public"."organization_billing" add constraint "organization_billing_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE not valid;

alter table "public"."organization_billing" validate constraint "organization_billing_organization_id_fkey";

alter table "public"."organization_billing" add constraint "organization_billing_stripe_customer_id_key" UNIQUE using index "organization_billing_stripe_customer_id_key";

alter table "public"."organization_invites" add constraint "organization_invites_invited_by_fkey" FOREIGN KEY (invited_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL not valid;

alter table "public"."organization_invites" validate constraint "organization_invites_invited_by_fkey";

alter table "public"."organization_invites" add constraint "organization_invites_organization_id_email_key" UNIQUE using index "organization_invites_organization_id_email_key";

alter table "public"."organization_invites" add constraint "organization_invites_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE not valid;

alter table "public"."organization_invites" validate constraint "organization_invites_organization_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_new_workspace(workspace_name text, workspace_entity_type text, target_user_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_org_id UUID;
BEGIN
  -- 1. Insert Organization (kira_user_id is left NULL as we altered it earlier)
  INSERT INTO public.organizations (name, entity_type)
  VALUES (workspace_name, workspace_entity_type)
  RETURNING id INTO new_org_id;

  -- 2. Insert Member (Admin)
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (new_org_id, target_user_id, 'admin');

  -- 3. Insert Billing Defaults
  INSERT INTO public.organization_billing (organization_id, fee_rate_bps, min_monthly_volume_usd)
  VALUES (new_org_id, 150, 0);

  -- Return the new ID back to Next.js
  RETURN new_org_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_my_system_role()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT system_role FROM public.user_profiles WHERE id = auth.uid();
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (NEW.id, NEW.email);
  
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."organization_billing" to "anon";

grant insert on table "public"."organization_billing" to "anon";

grant references on table "public"."organization_billing" to "anon";

grant select on table "public"."organization_billing" to "anon";

grant trigger on table "public"."organization_billing" to "anon";

grant truncate on table "public"."organization_billing" to "anon";

grant update on table "public"."organization_billing" to "anon";

grant delete on table "public"."organization_billing" to "authenticated";

grant insert on table "public"."organization_billing" to "authenticated";

grant references on table "public"."organization_billing" to "authenticated";

grant select on table "public"."organization_billing" to "authenticated";

grant trigger on table "public"."organization_billing" to "authenticated";

grant truncate on table "public"."organization_billing" to "authenticated";

grant update on table "public"."organization_billing" to "authenticated";

grant delete on table "public"."organization_billing" to "service_role";

grant insert on table "public"."organization_billing" to "service_role";

grant references on table "public"."organization_billing" to "service_role";

grant select on table "public"."organization_billing" to "service_role";

grant trigger on table "public"."organization_billing" to "service_role";

grant truncate on table "public"."organization_billing" to "service_role";

grant update on table "public"."organization_billing" to "service_role";

grant delete on table "public"."organization_invites" to "anon";

grant insert on table "public"."organization_invites" to "anon";

grant references on table "public"."organization_invites" to "anon";

grant select on table "public"."organization_invites" to "anon";

grant trigger on table "public"."organization_invites" to "anon";

grant truncate on table "public"."organization_invites" to "anon";

grant update on table "public"."organization_invites" to "anon";

grant delete on table "public"."organization_invites" to "authenticated";

grant insert on table "public"."organization_invites" to "authenticated";

grant references on table "public"."organization_invites" to "authenticated";

grant select on table "public"."organization_invites" to "authenticated";

grant trigger on table "public"."organization_invites" to "authenticated";

grant truncate on table "public"."organization_invites" to "authenticated";

grant update on table "public"."organization_invites" to "authenticated";

grant delete on table "public"."organization_invites" to "service_role";

grant insert on table "public"."organization_invites" to "service_role";

grant references on table "public"."organization_invites" to "service_role";

grant select on table "public"."organization_invites" to "service_role";

grant trigger on table "public"."organization_invites" to "service_role";

grant truncate on table "public"."organization_invites" to "service_role";

grant update on table "public"."organization_invites" to "service_role";


  create policy "Operations can view deposits"
  on "public"."deposits"
  as permissive
  for select
  to public
using ((public.get_my_system_role() = ANY (ARRAY['super_admin'::text, 'operations'::text])));



  create policy "Compliance can manage KYC"
  on "public"."kyc_profiles"
  as permissive
  for all
  to public
using ((public.get_my_system_role() = ANY (ARRAY['super_admin'::text, 'compliance'::text])));



  create policy "Users can view org kyc status"
  on "public"."kyc_profiles"
  as permissive
  for select
  to authenticated
using ((organization_id IN ( SELECT organization_members.organization_id
   FROM public.organization_members
  WHERE (organization_members.user_id = auth.uid()))));



  create policy "Admins and Ops can update deliveries"
  on "public"."notification_deliveries"
  as permissive
  for update
  to public
using ((public.get_my_system_role() = ANY (ARRAY['super_admin'::text, 'operations'::text])));



  create policy "Internal staff can view deliveries"
  on "public"."notification_deliveries"
  as permissive
  for select
  to public
using ((public.get_my_system_role() = ANY (ARRAY['super_admin'::text, 'compliance'::text, 'operations'::text, 'support'::text])));



  create policy "Internal staff can view system events"
  on "public"."notification_events"
  as permissive
  for select
  to public
using ((public.get_my_system_role() = ANY (ARRAY['super_admin'::text, 'compliance'::text, 'operations'::text, 'support'::text])));



  create policy "Users can view their organization billing details"
  on "public"."organization_billing"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.organization_members
  WHERE ((organization_members.organization_id = organization_billing.organization_id) AND (organization_members.user_id = auth.uid())))));



  create policy "Admins can manage org invites"
  on "public"."organization_invites"
  as permissive
  for all
  to authenticated
using ((organization_id IN ( SELECT organization_members.organization_id
   FROM public.organization_members
  WHERE ((organization_members.user_id = auth.uid()) AND ((organization_members.role)::text = 'admin'::text)))));



  create policy "Admins and Ops can delete org members"
  on "public"."organization_members"
  as permissive
  for delete
  to public
using ((public.get_my_system_role() = ANY (ARRAY['super_admin'::text, 'operations'::text])));



  create policy "Admins can delete members"
  on "public"."organization_members"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.organization_members my_membership
  WHERE ((my_membership.organization_id = organization_members.organization_id) AND (my_membership.user_id = auth.uid()) AND ((my_membership.role)::text = 'admin'::text)))));



  create policy "Admins can insert new members"
  on "public"."organization_members"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM public.organization_members my_membership
  WHERE ((my_membership.organization_id = organization_members.organization_id) AND (my_membership.user_id = auth.uid()) AND ((my_membership.role)::text = 'admin'::text)))));



  create policy "Internal staff can view all org members"
  on "public"."organization_members"
  as permissive
  for select
  to public
using ((public.get_my_system_role() = ANY (ARRAY['super_admin'::text, 'compliance'::text, 'operations'::text, 'support'::text])));



  create policy "Users can leave organization"
  on "public"."organization_members"
  as permissive
  for delete
  to authenticated
using ((user_id = auth.uid()));



  create policy "Users can view own membership"
  on "public"."organization_members"
  as permissive
  for select
  to authenticated
using ((user_id = auth.uid()));



  create policy "Compliance can view Organizations"
  on "public"."organizations"
  as permissive
  for select
  to public
using ((public.get_my_system_role() = ANY (ARRAY['super_admin'::text, 'compliance'::text, 'operations'::text, 'support'::text])));



  create policy "Update organization if admin"
  on "public"."organizations"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.organization_members
  WHERE ((organization_members.organization_id = organizations.id) AND (organization_members.user_id = auth.uid()) AND ((organization_members.role)::text = 'admin'::text)))));



  create policy "View organization if member"
  on "public"."organizations"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.organization_members
  WHERE ((organization_members.organization_id = organizations.id) AND (organization_members.user_id = auth.uid())))));



  create policy "Operations can manage payouts"
  on "public"."payouts"
  as permissive
  for update
  to public
using ((public.get_my_system_role() = ANY (ARRAY['super_admin'::text, 'operations'::text])));



  create policy "Operations can view payouts"
  on "public"."payouts"
  as permissive
  for select
  to public
using ((public.get_my_system_role() = ANY (ARRAY['super_admin'::text, 'operations'::text])));



  create policy "Internal staff can view all users"
  on "public"."user_profiles"
  as permissive
  for select
  to public
using ((public.get_my_system_role() = ANY (ARRAY['super_admin'::text, 'compliance'::text, 'operations'::text, 'support'::text])));



  create policy "Super admins can update users"
  on "public"."user_profiles"
  as permissive
  for update
  to public
using ((public.get_my_system_role() = 'super_admin'::text));



  create policy "Users can update own profile"
  on "public"."user_profiles"
  as permissive
  for update
  to authenticated
using ((auth.uid() = id));


CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

drop policy "Users can upload their own docs" on "storage"."objects";

drop policy "Users can view their own docs" on "storage"."objects";


  create policy "Users can upload to their org folder"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'compliance_documents'::text) AND ((storage.foldername(name))[1] IN ( SELECT (organization_members.organization_id)::text AS organization_id
   FROM public.organization_members
  WHERE (organization_members.user_id = auth.uid())))));



  create policy "Users can view their org docs"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'compliance_documents'::text) AND ((storage.foldername(name))[1] IN ( SELECT (organization_members.organization_id)::text AS organization_id
   FROM public.organization_members
  WHERE (organization_members.user_id = auth.uid())))));



