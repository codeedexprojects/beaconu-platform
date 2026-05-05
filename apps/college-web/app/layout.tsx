import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BeaconU — College Web Portal',
  description: 'College student portal',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
