import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import "./globals.css";

const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SaveMe Budget — จัดการเงินง่ายขึ้น เหลือเงินเก็บมากขึ้น",
  description: "บันทึกรายจ่าย ดูยอดใช้จ่ายรายเดือน และแยกตามหมวดหมู่ได้ง่าย ๆ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${sarabun.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
