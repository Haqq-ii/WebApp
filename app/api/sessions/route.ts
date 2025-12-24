import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/requireUser'
import { getChatSessions, createChatSession } from '@/lib/db'

export async function GET() {
  try {
    const { user } = await requireUser()
    const sessions = await getChatSessions(user.id)
    return NextResponse.json(sessions)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch sessions', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    const { user } = await requireUser()
    const session = await createChatSession(user.id)
    if (!session) {
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }
    return NextResponse.json(session)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create session', details: error.message },
      { status: 500 }
    )
  }
}

