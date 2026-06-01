/** Display name shown in admin top bar */
export const ADMIN_OWNER_NAME = "Patrick Anei";

export const ADMIN_APP_TITLE = "Luo Social Admin";

export const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/admin/users", label: "Users", icon: "Users" },
  { href: "/admin/posts", label: "Posts", icon: "FileText" },
  { href: "/admin/reports", label: "Reports", icon: "Flag" },
  { href: "/admin/analytics", label: "Analytics", icon: "BarChart3" },
  { href: "/admin/settings", label: "Settings", icon: "Settings" },
] as const;
