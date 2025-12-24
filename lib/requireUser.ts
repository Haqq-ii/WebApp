import { createServerClient } from './supabaseServer'
import { redirect } from 'next/navigation'

export async function requireUser() {
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    redirect('/auth')
  }

  return { user: session.user, supabase }
}

