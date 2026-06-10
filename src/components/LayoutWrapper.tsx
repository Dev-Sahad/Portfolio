"use client";

import { usePathname } from "next/navigation";
import HiddenAdminAccess from "./HiddenAdminAccess";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAdmin = pathname?.startsWith("/admin");

  return (
    <>
      {children}

      {!isAdmin && (
        <>
          <HiddenAdminAccess />
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "var(--text-secondary)",
              fontSize: "12px",
            }}
          >
            © 2026 Muhammad Sahad. All rights reserved.
          </div>
        </>
      )}
    </>
  );
}
