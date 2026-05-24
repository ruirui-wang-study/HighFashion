import { AdminHeader } from "./admin-header";
import { AdminSidebar } from "./admin-sidebar";
import type { AdminSessionPayload } from "@/lib/admin-session";

export function AdminShell({ session, children }: { session: AdminSessionPayload; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-warm text-graphite">
      <div className="flex min-h-screen">
        <AdminSidebar role={session.role} />
        <div className="flex min-h-screen flex-1 flex-col">
          <AdminHeader name={session.name} role={session.role} />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
