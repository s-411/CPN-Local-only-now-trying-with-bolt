import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { AppProvider } from '@/lib/context'
import { ShareProvider } from '@/lib/share/ShareContext'
import ShareModalWrapper from '@/components/sharing/ShareModalWrapper'
import LayoutWrapper from '@/components/LayoutWrapper'

export const metadata: Metadata = {
  title: 'CPN v2 - Cost Per Nut Calculator',
  description: 'Personal relationship metrics tracking application',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const rewardfulApiKey = process.env.NEXT_PUBLIC_REWARDFUL_API_KEY;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-cpn-dark text-cpn-white min-h-screen" suppressHydrationWarning>
        <AppProvider>
          <ShareProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
            <ShareModalWrapper />
          </ShareProvider>
        </AppProvider>

        {/* Rewardful Affiliate Tracking */}
        {rewardfulApiKey && (
          <>
            <Script
              id="rewardful-queue"
              strategy="beforeInteractive"
              dangerouslySetInnerHTML={{
                __html: `(function(w,r){w._rwq=r;w[r]=w[r]||function(){(w[r].q=w[r].q||[]).push(arguments)}})(window,'rewardful');`,
              }}
            />
            <Script
              src="https://r.wdfl.co/rw.js"
              data-rewardful={rewardfulApiKey}
              strategy="afterInteractive"
            />
          </>
        )}
      </body>
    </html>
  )
}
