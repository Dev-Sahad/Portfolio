import type { Metadata } from "next";
import Sidebar from "@/app/admin/Sidebar";

export const metadata: Metadata = {
  title: "Admin Panel | Portfolio",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-shell min-h-screen text-white">
      <Sidebar />
      <main className="admin-content lg:ml-[280px] pt-[100px] lg:pt-8 min-h-screen px-4 sm:px-6 lg:px-9 pb-10">
        <div className="max-w-[1440px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
