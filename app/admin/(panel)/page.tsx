import { DashboardOverview } from "@/components/admin/dashboard-overview";

/** /admin — Dashboard overview */
export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Dashboard</h1>
      <DashboardOverview />
    </div>
  );
}
