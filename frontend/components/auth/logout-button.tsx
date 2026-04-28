import Link from "next/link";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <Link
      href="/api/session/logout"
      prefetch={false}
      className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
    >
      <LogOut className="size-4" />
      تسجيل الخروج
    </Link>
  );
}
