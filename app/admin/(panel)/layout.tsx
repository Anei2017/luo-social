import { requireSuperAdmin } from "@/lib/admin/require-super-admin";
import { AdminLayout } from "@/components/admin/admin-layout";

/** Server-side super_admin check for all panel routes */
export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminUser = await requireSuperAdmin();
  return <AdminLayout adminUser={adminUser}>{children}</AdminLayout>;
}
