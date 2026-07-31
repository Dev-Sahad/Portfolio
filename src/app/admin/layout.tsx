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
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Sidebar />
      <main className="lg:ml-[250px] pt-[95px] lg:pt-6 min-h-screen px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
