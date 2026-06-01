import { AppSettingsForm } from "@/components/admin/app-settings-form";

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">App settings</h1>
      <AppSettingsForm />
    </div>
  );
}
