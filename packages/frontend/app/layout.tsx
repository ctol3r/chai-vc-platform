export const metadata = {
  title: 'VitalCV',
  description: 'Healthcare credentialing and verification platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
