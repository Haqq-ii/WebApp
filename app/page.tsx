import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createServerClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const appName = process.env.NEXT_PUBLIC_APP_NAME || process.env.APP_NAME || 'AI Chat'
  const appDescription =
    'Experience intelligent conversations powered by AI. Chat naturally and get instant, helpful responses.'

  const features = [
    'Natural language conversations',
    'Persistent chat history',
    'Secure authentication',
    'Fast and responsive',
    'Powered by advanced AI',
    'Clean and intuitive interface',
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            {appName}
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            {appDescription}
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            {session ? (
              <Link
                href="/chat"
                className="rounded-lg bg-gray-900 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
              >
                Go to Chat
              </Link>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="rounded-lg bg-gray-900 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                >
                  Try Chat
                </Link>
                <Link
                  href="/auth"
                  className="text-base font-semibold leading-6 text-gray-900"
                >
                  Learn more <span aria-hidden="true">→</span>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mx-auto mt-24 max-w-2xl">
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Features
          </h2>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-2 text-2xl">✨</div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {feature}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

