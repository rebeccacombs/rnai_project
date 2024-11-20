import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Space_Grotesk } from 'next/font/google'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
})

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const logika = localFont({
  src: [
    {
      path: './fonts/LogikaNova-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/LogikaNova-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-logika',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "RNAi Database",
  description: "By Rebecca Combs and Chesney Birshing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${logika.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}