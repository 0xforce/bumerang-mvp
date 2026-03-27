import { z } from "zod"

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  phone: z
    .string()
    .optional()
    .transform((v) => {
      if (!v) return undefined
      const trimmed = v.trim()
      const digits = trimmed.replace(/\D/g, "")
      return trimmed.startsWith("+") ? `+${digits}` : digits ? `+${digits}` : undefined
    })
    .refine((v) => !v || /^\+[1-9]\d{7,14}$/.test(v), {
      message: "Enter a valid phone number with country code (e.g. +44 7911 123456)",
    }),
})

export type UpdateProfilePayload = z.infer<typeof updateProfileSchema>

export type UserActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string }
