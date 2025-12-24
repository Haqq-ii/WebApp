import Navbar from '@/components/Navbar'
import AuthTabs from '@/components/AuthTabs'
import { createServerClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

export default async function AuthPage() {
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect('/chat')
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
            {process.env.NEXT_PUBLIC_APP_NAME || process.env.APP_NAME || 'AI Chat'}
          </h1>
          <AuthTabs />
        </div>
      </main>
    </div>
  )
}

