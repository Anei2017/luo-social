import { AnalyticsCharts } from "@/components/admin/analytics-charts";

export default function AdminAnalyticsPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Analytics</h1>
      <AnalyticsCharts />
    </div>
  );
}
