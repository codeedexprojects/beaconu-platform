import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BeaconU – Powering India's College Experience",
  description:
    "BeaconU is the all-in-one student engagement platform trusted by leading Indian colleges. Partner with us to transform how your students learn, connect, and thrive.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
