import { redirect } from "next/navigation";
import { Search, Bell } from "lucide-react";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import AdminSidebar from "@/components/admin/AdminSidebar";
import "@/models/Tour";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.role !== "staff") {
    redirect("/admin/login");
  }

  await connectDB();
  const user = await User.findById(session.userId).select("name email").lean<any>();

  return (
    <div className="min-h-screen flex bg-cream">
      <AdminSidebar
        userName={user?.name ?? "Staff"}
        userEmail={user?.email ?? ""}
      />
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-forest/10 px-8 py-4 flex items-center justify-end gap-4">
          {/* Not wired up yet — global admin search comes later, once
              there's enough content (tours/bookings/customers) to search. */}
          <div className="relative w-64">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-forest/40"
            />
            <input
              type="text"
              placeholder="Search..."
              disabled
              className="w-full bg-cream border border-forest/10 rounded-lg pl-9 pr-3 py-2 text-sm text-forest/60 cursor-not-allowed"
            />
          </div>
          <button className="relative text-forest/60 hover:text-forest">
            <Bell size={20} />
          </button>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}