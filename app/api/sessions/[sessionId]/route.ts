import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/requireUser'
import {
  getChatMessages,
  deleteChatSession,
  updateChatSessionTitle,
} from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { user } = await requireUser()
    const { sessionId } = await params
    const messages = await getChatMessages(sessionId, user.id)
    return NextResponse.json(messages)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch messages', details: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { user } = await requireUser()
    const { sessionId } = await params
    const body = await request.json()
    const { title } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const success = await updateChatSessionTitle(sessionId, user.id, title)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update session' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update session', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { user } = await requireUser()
    const { sessionId } = await params
    const success = await deleteChatSession(sessionId, user.id)
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete session' },
        { status: 500 }
      )
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete session', details: error.message },
      { status: 500 }
    )
  }
}

