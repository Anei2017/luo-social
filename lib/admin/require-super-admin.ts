import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { api } from "@/convex/_generated/api";

export type AdminUser = {
  _id: string;
  displayName: string;
  username: string;
  email?: string;
  role?: string;
};

/**
 * Server-side gate for /admin panel routes.
 * Role must be super_admin (set via Convex SUPER_ADMIN_CLERK_IDS + bootstrap).
 */
export async function requireSuperAdmin(): Promise<AdminUser> {
  const { userId, getToken } = await auth();
  if (!userId) redirect("/admin/login");

  const token =
    (await getToken({ template: "convex" })) ?? (await getToken()) ?? undefined;

  const user = await fetchQuery(api.users.current, {}, { token });

  if (!user || user.role !== "super_admin") {
    redirect("/admin/login?error=unauthorized");
  }

  return user as AdminUser;
}
