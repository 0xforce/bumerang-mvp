import { z } from "zod"
import { COUNTRIES, BANNED_COUNTRY_CODES } from "@/lib/data/countries"

// ─── Error message bag ────────────────────────────────────────────────────────
// Passed in from the React component so all messages are translated.

export interface ComplianceErrors {
  required: string
  tooShort: string
  invalidDate: string
  futureDate: string
  usaNotPermitted: string
  invalidPhone: string
  mustBeAdult: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const validCountryCodes = COUNTRIES.map((c) => c.code)

function isAllowedCountry(code: string) {
  const upper = code.toUpperCase()
  return (
    !BANNED_COUNTRY_CODES.includes(upper) && validCountryCodes.includes(code)
  )
}

function isPastDate(val: string) {
  const d = new Date(val)
  return !isNaN(d.getTime()) && d < new Date()
}

function isAdult(dob: string) {
  const d = new Date(dob)
  const age = new Date()
  age.setFullYear(age.getFullYear() - 18)
  return d <= age
}

function normalizePhone(value: string) {
  const trimmed = value.trim()
  const hasPlusPrefix = trimmed.startsWith("+")
  const digitsOnly = trimmed.replace(/\D/g, "")
  return hasPlusPrefix ? `+${digitsOnly}` : `+${digitsOnly}`
}

function isValidE164Phone(value: string) {
  return /^\+[1-9]\d{7,14}$/.test(value)
}

// ─── KYC (Individual) schema factory ─────────────────────────────────────────

export function createKycSchema(err: ComplianceErrors) {
  return z.object({
    // Step 1 — Personal Details
    firstName: z.string().min(2, err.tooShort),
    lastName: z.string().min(2, err.tooShort),
    dob: z
      .string()
      .min(1, err.required)
      .refine(isPastDate, err.invalidDate)
      .refine(isAdult, err.mustBeAdult),
    phone: z
      .string()
      .min(1, err.required)
      .transform(normalizePhone)
      .refine(isValidE164Phone, err.invalidPhone),
    nationality: z
      .string()
      .min(1, err.required)
      .refine(isAllowedCountry, err.usaNotPermitted)
      .refine((val) => val !== "US", err.usaNotPermitted),

    // Step 2 — Address
    street: z.string().min(3, err.tooShort),
    city: z.string().min(2, err.tooShort),
    state: z.string().min(1, err.required),
    postalCode: z.string().min(3, err.tooShort),
    country: z
      .string()
      .min(1, err.required)
      .refine(isAllowedCountry, err.usaNotPermitted)
      .refine((val) => val !== "US", err.usaNotPermitted),

    // Step 3 — Identification
    documentType: z.enum(["passport", "nationalId", "driversLicense"], {
      error: err.required,
    }),
    documentNumber: z.string().min(4, err.tooShort),
    documentCountry: z
      .string()
      .min(1, err.required)
      .refine(isAllowedCountry, err.usaNotPermitted)
      .refine((val) => val !== "US", err.usaNotPermitted),

    // Step 4 — Documents (URLs)
    idFrontUrl: z.string().min(1, err.required),
    idBackUrl: z.string().optional(),
    poaUrl: z.string().min(1, err.required),
  })
}

export type KycFormData = {
  firstName: string
  lastName: string
  dob: string
  phone: string
  nationality: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  documentType: "passport" | "nationalId" | "driversLicense"
  documentNumber: string
  documentCountry: string
  idFrontUrl: string
  idBackUrl?: string
  poaUrl: string
}

// ─── KYB (Business) schema factory ───────────────────────────────────────────

export function createKybSchema(err: ComplianceErrors) {
  return z.object({
    // Step 1 — Business Details
    legalName: z.string().min(2, err.tooShort),
    entityType: z.enum(["LLC", "LTD", "Corp", "SA", "SAS", "GmbH", "BV", "Other"], {
      error: err.required,
    }),
    incorporationDate: z
      .string()
      .min(1, err.required)
      .refine(isPastDate, err.invalidDate),
    registrationNumber: z.string().min(3, err.tooShort),
    countryOfIncorporation: z
      .string()
      .min(1, err.required)
      .refine(isAllowedCountry, err.usaNotPermitted)
      .refine((val) => val !== "US", err.usaNotPermitted),

    // Step 2 — Business Address
    street: z.string().min(3, err.tooShort),
    city: z.string().min(2, err.tooShort),
    state: z.string().min(1, err.required),
    postalCode: z.string().min(3, err.tooShort),
    country: z
      .string()
      .min(1, err.required)
      .refine(isAllowedCountry, err.usaNotPermitted)
      .refine((val) => val !== "US", err.usaNotPermitted),

    // Step 3 — UBO (Ultimate Beneficial Owner)
    uboFirstName: z.string().min(2, err.tooShort),
    uboLastName: z.string().min(2, err.tooShort),
    uboDob: z
      .string()
      .min(1, err.required)
      .refine(isPastDate, err.invalidDate)
      .refine(isAdult, err.mustBeAdult),
    uboDocumentType: z.enum(["passport", "nationalId", "driversLicense"], {
      error: err.required,
    }),
    uboDocumentNumber: z.string().min(4, err.tooShort),
    uboDocumentCountry: z
      .string()
      .min(1, err.required)
      .refine(isAllowedCountry, err.usaNotPermitted)
      .refine((val) => val !== "US", err.usaNotPermitted),
    uboAddress: z.string().min(5, err.tooShort),

    // Step 4 — Documents (URLs)
    incorporationDocUrl: z.string().min(1, err.required),
    uboIdFrontUrl: z.string().min(1, err.required),
    uboIdBackUrl: z.string().optional(),
    uboPoaUrl: z.string().min(1, err.required),
  })
}

export type KybFormData = {
  legalName: string
  entityType: "LLC" | "LTD" | "Corp" | "SA" | "SAS" | "GmbH" | "BV" | "Other"
  incorporationDate: string
  registrationNumber: string
  countryOfIncorporation: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  uboFirstName: string
  uboLastName: string
  uboDob: string
  uboDocumentType: "passport" | "nationalId" | "driversLicense"
  uboDocumentNumber: string
  uboDocumentCountry: string
  uboAddress: string
  incorporationDocUrl: string
  uboIdFrontUrl: string
  uboIdBackUrl?: string
  uboPoaUrl: string
}

// ─── Step-level field names ───────────────────────────────────────────────────
// Used to selectively trigger validation when advancing a step.

export const KYC_STEPS: (keyof KycFormData)[][] = [
  ["firstName", "lastName", "dob", "phone", "nationality"],
  ["street", "city", "state", "postalCode", "country"],
  ["documentType", "documentNumber", "documentCountry"],
  ["idFrontUrl", "idBackUrl", "poaUrl"],
]

export const KYB_STEPS: (keyof KybFormData)[][] = [
  ["legalName", "entityType", "incorporationDate", "registrationNumber", "countryOfIncorporation"],
  ["street", "city", "state", "postalCode", "country"],
  ["uboFirstName", "uboLastName", "uboDob", "uboDocumentType", "uboDocumentNumber", "uboDocumentCountry", "uboAddress"],
  ["incorporationDocUrl", "uboIdFrontUrl", "uboIdBackUrl", "uboPoaUrl"],
]
