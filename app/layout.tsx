import type { Metadata } from 'next'
import './globals.css'

const appName = process.env.APP_NAME || 'AI Chat'

export const metadata: Metadata = {
  title: appName,
  description: 'AI Chat application powered by n8n and OpenAI',
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

