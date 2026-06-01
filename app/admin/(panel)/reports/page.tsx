import { ReportsQueue } from "@/components/admin/reports-queue";

export default function AdminReportsPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Reports</h1>
      <ReportsQueue />
    </div>
  );
}
