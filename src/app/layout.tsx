import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ASCEND — Your Life. Your Quest. Your Level.",
  description:
    "A gamified real-life productivity RPG. Level up your real life.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}
