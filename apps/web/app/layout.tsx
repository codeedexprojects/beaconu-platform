import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BeaconU",
  description: "Your college admission companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
