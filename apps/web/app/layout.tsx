import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "BeaconU — India's Student Experience Platform",
  description:
    "BeaconU connects students to colleges, resources, and opportunities across India.",
  metadataBase: new URL("https://beaconu.com"),
  alternates: { canonical: "https://beaconu.com" },
  keywords: [
    "college admissions",
    "student platform",
    "India colleges",
    "BeaconU",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    siteName: "BeaconU",
    type: "website",
    url: "https://beaconu.com",
    title: "BeaconU — India's Student Experience Platform",
    description:
      "BeaconU connects students to colleges, resources, and opportunities across India.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@beaconu",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
