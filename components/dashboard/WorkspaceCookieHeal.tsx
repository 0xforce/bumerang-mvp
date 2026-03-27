"use client"

import * as React from "react"
import { setActiveWorkspace } from "@/actions/workspace"

/**
 * Heals `bumerang_organization_id` + `last_active_organization_id` when SSR resolved an org
 * that wasn't yet reflected in the cookie (e.g. new device, cleared cookies).
 */
export function WorkspaceCookieHeal({
  organizationId,
  enabled,
}: {
  organizationId: string
  enabled: boolean
}) {
  const ran = React.useRef(false)

  React.useEffect(() => {
    if (!enabled || !organizationId || ran.current) return
    ran.current = true
    void setActiveWorkspace(organizationId)
  }, [enabled, organizationId])

  return null
}
