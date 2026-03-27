/**
 * Canonical KYC / verification pipeline states (stored in `kyc_profiles.verification_status`).
 * Legacy values from older backends are normalized at read time — see `normalizeVerificationStatus`.
 */
export type VerificationStatus =
  | "UNVERIFIED"
  | "PENDING"
  | "PROCESSING"
  | "SHUFTI_APPROVED"
  | "APPROVED"
  | "REJECTED"

const CANONICAL: VerificationStatus[] = [
  "UNVERIFIED",
  "PENDING",
  "PROCESSING",
  "SHUFTI_APPROVED",
  "APPROVED",
  "REJECTED",
]

/** Maps deprecated DB strings to current pipeline states. */
const LEGACY: Record<string, VerificationStatus> = {
  CREATED: "UNVERIFIED",
  SUBMITTED_TO_DB: "PENDING",
  VERIFIED: "APPROVED",
}

export function normalizeVerificationStatus(
  raw: string | null | undefined,
): VerificationStatus {
  const v = (raw ?? "").trim()
  if (!v) return "UNVERIFIED"
  const upper = v.toUpperCase()
  if (LEGACY[upper]) return LEGACY[upper]
  if (CANONICAL.includes(upper as VerificationStatus)) {
    return upper as VerificationStatus
  }
  return "UNVERIFIED"
}

/** Full access — product rule: only final approval unlocks the experience we treat as "verified". */
export function isVerificationApproved(status: VerificationStatus): boolean {
  return status === "APPROVED"
}

export function isRejected(status: VerificationStatus): boolean {
  return status === "REJECTED"
}

/** In the async pipeline (submitted, not terminal). */
export function isVerificationInFlight(status: VerificationStatus): boolean {
  return (
    status === "PENDING" ||
    status === "PROCESSING" ||
    status === "SHUFTI_APPROVED"
  )
}
