import { getPendingPlatformInvites } from "./actions"
import { InvitesClient } from "./InvitesClient"

export default async function InvitesPage() {
  const pendingInvites = await getPendingPlatformInvites()
  return <InvitesClient pendingInvites={pendingInvites} />
}
