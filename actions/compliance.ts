"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"
import {
  createKycSchema,
  createKybSchema,
  type ComplianceErrors,
} from "@/lib/validations/compliance"

export type SubmitComplianceResult =
  | { success: true }
  | { success: false; error: string }

const fallbackErrors: ComplianceErrors = {
  required: "Required",
  tooShort: "Too short",
  invalidDate: "Invalid date",
  futureDate: "Cannot be future date",
  usaNotPermitted: "US not permitted",
  invalidPhone: "Invalid phone",
  mustBeAdult: "Must be adult",
}

export async function submitComplianceData(
  payload: unknown,
  type: "individual" | "business",
  organizationId: string
): Promise<SubmitComplianceResult> {
  try {
    const supabase = await createClient()

    // 1. Auth Check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Unauthorized. Please log in." }
    }

    // 2. Role Check (Enterprise Authorization)
    const { data: member, error: memberError } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .single()

    if (memberError || !member) {
      return {
        success: false,
        error: "You do not belong to this organization.",
      }
    }

    if (type === "business" && member.role !== "admin") {
      return {
        success: false,
        error: "Only Organization Admins can submit corporate verification.",
      }
    }

    // 3. Validation & Strict Normalization (To snake_case for Python)
    let normalizedPayload: Record<string, any> = {}

    if (type === "individual") {
      const schema = createKycSchema(fallbackErrors)
      const parsed = schema.safeParse(payload)

      if (!parsed.success) {
        console.error("KYC Validation failed:", parsed.error.flatten())
        return { success: false, error: "Invalid KYC data provided. Please check your inputs." }
      }

      const data = parsed.data
      normalizedPayload = {
        first_name: data.firstName,
        last_name: data.lastName,
        dob: data.dob,
        phone: data.phone,
        nationality: data.nationality,
        street: data.street,
        city: data.city,
        state: data.state,
        postal_code: data.postalCode,
        country: data.country,
        document_type: data.documentType,
        document_number: data.documentNumber,
        document_country: data.documentCountry,
        id_front_url: data.idFrontUrl,
        id_back_url: data.idBackUrl,
        poa_url: data.poaUrl,
      }
    } else {
      const schema = createKybSchema(fallbackErrors)
      const parsed = schema.safeParse(payload)

      if (!parsed.success) {
        console.error("KYB Validation failed:", parsed.error.flatten())
        return { success: false, error: "Invalid KYB data provided. Please check your inputs." }
      }

      const data = parsed.data
      normalizedPayload = {
        legal_name: data.legalName,
        entity_type: data.entityType,
        incorporation_date: data.incorporationDate,
        registration_number: data.registrationNumber,
        country_of_incorporation: data.countryOfIncorporation,
        street: data.street,
        city: data.city,
        state: data.state,
        postal_code: data.postalCode,
        country: data.country,
        ubo_first_name: data.uboFirstName,
        ubo_last_name: data.uboLastName,
        ubo_dob: data.uboDob,
        ubo_document_type: data.uboDocumentType,
        ubo_document_number: data.uboDocumentNumber,
        ubo_document_country: data.uboDocumentCountry,
        ubo_address: data.uboAddress,
        incorporation_doc_url: data.incorporationDocUrl,
        ubo_id_front_url: data.uboIdFrontUrl,
        ubo_id_back_url: data.uboIdBackUrl,
        ubo_poa_url: data.uboPoaUrl,
      }
    }

    // 4. Secure Handoff to Python FastAPI Backend
    const backendUrl = process.env.PYTHON_API_URL || "http://127.0.0.1:8000"
    const internalSecret = process.env.INTERNAL_API_SECRET

    if (!internalSecret) {
      console.error("🚨 CRITICAL: INTERNAL_API_SECRET is missing in environment variables.")
      return { success: false, error: "Server misconfiguration. Please contact support." }
    }

    const pythonPayload = {
      type: type,
      organization_id: organizationId,
      payload: normalizedPayload,
    }

    try {
      const response = await fetch(`${backendUrl}/api/v1/kyc/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Secret": internalSecret,
        },
        body: JSON.stringify(pythonPayload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("🚨 FastAPI rejected the submission:", errorData)
        return { success: false, error: "Verification engine temporarily unavailable. Please try again." }
      }

      // Mark pipeline as PENDING immediately so the dashboard reflects "submitted" without naming vendors.
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
          const admin = createAdminClient()
          const { error: kycErr } = await admin.from("kyc_profiles").upsert(
            { organization_id: organizationId, verification_status: "PENDING" },
            { onConflict: "organization_id" },
          )
          if (kycErr) console.error("kyc_profiles PENDING upsert:", kycErr)
        } catch (e) {
          console.error("Could not set verification_status to PENDING:", e)
        }
      }

      revalidatePath("/", "layout")

      return { success: true }

    } catch (fetchError) {
      console.error("🚨 Network error reaching FastAPI:", fetchError)
      return { success: false, error: "Could not connect to the verification engine. Please try again later." }
    }

  } catch (error) {
    console.error("🚨 Unhandled Compliance Action Error:", error)
    return { success: false, error: "An unexpected system error occurred." }
  }
}