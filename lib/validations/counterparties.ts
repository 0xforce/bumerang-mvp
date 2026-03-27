import { z } from "zod"
import type { Tables } from "@/types/supabase"

export const counterpartySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  jurisdiction: z.string().min(1, "Jurisdiction is required"),
  business_registration_number: z.string().optional(),
  business_address: z.string().min(5, "Address must be at least 5 characters"),
  business_website: z.string().optional(),
  bank_name: z.string().min(2, "Bank name is required"),
  bank_address: z.string().min(5, "Bank address is required"),
  account_beneficiary_name: z.string().min(2, "Beneficiary name is required"),
  account_number: z.string().min(4, "Account number is required"),
  routing_number: z.string().min(9, "Routing number must be 9 digits").max(9),
  swift_code: z.string().optional(),
  phone_number: z.string().optional(),
  email: z.union([z.string().email("Invalid email address"), z.literal(""), z.undefined()]),
})

export type CounterpartyPayload = z.infer<typeof counterpartySchema>
export type Counterparty = Tables<"counterparties">

export type CounterpartyActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string }
