import { DashboardKPIs } from "./views/DashboardKPIs"
import { DashboardAnalytics } from "./views/DashboardAnalytics"
import { DashboardRecentTransactions } from "./views/DashboardRecentTransactions"
import { DashboardEducation } from "./views/DashboardEducation"
import { TestUtilitiesButton } from "./views/TestUtilitiesButton"

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 pb-24">
      {/* Temporary dev utility tester — remove before launch */}
      <div className="flex justify-end">
        <TestUtilitiesButton />
      </div>

      <DashboardKPIs />
      
      <DashboardAnalytics />
      
      <DashboardRecentTransactions />
      
      <DashboardEducation />
    </div>
  )
}
