"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Map, Calendar, Users, MessageSquare, LogOut } from "lucide-react";

const LINKS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/tours", label: "Tours", icon: Map },
  { href: "/admin/bookings", label: "Bookings", icon: Calendar },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/inquiries", label: "Messages", icon: MessageSquare },
];
export default function AdminSidebar({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="w-64 bg-forest text-cream flex flex-col p-6">
      <Image
        src="/logo.png"
        alt="Safari Aunt Expedition"
        width={48}
        height={48}
        className="rounded-lg mb-8"
      />

      <nav className="flex-1 space-y-1">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active ? "bg-cream/10 text-cream" : "text-cream/70 hover:bg-cream/5"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-cream/10 pt-4 space-y-3">
        <div className="flex items-center gap-3 px-1">
          <div className="w-9 h-9 rounded-full bg-mustard text-forest flex items-center justify-center text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-cream truncate">{userName}</p>
            <p className="text-xs text-cream/60 truncate">{userEmail}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-cream/70 hover:bg-cream/5"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </aside>
  );
}