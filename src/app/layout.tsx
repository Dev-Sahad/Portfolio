import "./globals.css";
import RefreshRedirect from '@/components/RefreshRedirect'
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata = {
  title: "Muhammad Sahad",
  description: "Portfolio...",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <RefreshRedirect />
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
