import { UserTable } from "@/components/admin/user-table";

export default function AdminUsersPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">User management</h1>
      <UserTable />
    </div>
  );
}
