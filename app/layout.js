import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Jazz Classics - Timeless Standards from the Golden Age",
  description:
    "Some jazz standards from the 1920s, 1930s, and 1940s. Listen to timeless classics and learn about them.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
