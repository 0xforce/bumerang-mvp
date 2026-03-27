import { z } from "zod"

export const workspaceFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  entity_type: z.enum(["individual", "business"]),
})

export type WorkspaceFormValues = z.infer<typeof workspaceFormSchema>

/** Editable workspace label (`organizations.name`); not the legal entity name in KYC. */
export const workspaceDisplayNameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(120, "Name must be at most 120 characters")

export const updateWorkspaceNamePayloadSchema = z.object({
  name: workspaceDisplayNameSchema,
})

export type UpdateWorkspaceNamePayload = z.infer<typeof updateWorkspaceNamePayloadSchema>
