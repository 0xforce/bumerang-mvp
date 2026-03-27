import { z } from "zod"

export const inviteMemberSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["admin", "preparer", "viewer"]),
})

export type InviteMemberPayload = z.infer<typeof inviteMemberSchema>

export type TeamMember = {
  id: string
  role: string
  created_at: string
  user_id: string
  full_name: string | null
  email: string
}

export type TeamInvite = {
  id: string
  email: string
  role: string
  created_at: string
  status: string
}

export type TeamActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string }
