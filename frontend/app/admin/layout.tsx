import { AdminSidebar } from "@/components/nav/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-0 flex-1">
      <AdminSidebar />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
