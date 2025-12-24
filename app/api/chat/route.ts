import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/requireUser'
import { callN8NWebhook } from '@/lib/n8n'
import {
  createChatMessage,
  getChatMessages,
  updateChatSessionTitle,
} from '@/lib/db'

// TODO: Adjust payload/response format based on your n8n workflow requirements
export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await requireUser()

    const body = await request.json()
    const { sessionId, message } = body

    if (!sessionId || !message) {
      return NextResponse.json(
        { error: 'sessionId and message are required' },
        { status: 400 }
      )
    }

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id, title')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found or unauthorized' },
        { status: 404 }
      )
    }

    // Save user message to database
    const userMessage = await createChatMessage(
      sessionId,
      user.id,
      'user',
      message
    )

    if (!userMessage) {
      return NextResponse.json(
        { error: 'Failed to save user message' },
        { status: 500 }
      )
    }

    // Get recent chat history for context (last 10 messages)
    // TODO: Adjust the number of messages sent to n8n based on your needs
    const recentMessages = await getChatMessages(sessionId, user.id)
    const last10Messages = recentMessages.slice(-10)

    // Prepare history for n8n (format: { role, content })
    const history = last10Messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))

    // Call n8n webhook
    // TODO: Customize the payload structure based on your n8n workflow
    const n8nPayload = {
      app: process.env.APP_NAME || 'AI Chat',
      user_id: user.id,
      session_id: sessionId,
      message: message,
      history: history,
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'webapp',
        model: process.env.OPENAI_MODEL || 'gpt-4',
      },
    }

    let n8nResponse
    try {
      n8nResponse = await callN8NWebhook(n8nPayload)
    } catch (error: any) {
      console.error('N8N webhook error:', error)
      return NextResponse.json(
        {
          error: 'Failed to get AI response',
          details: error.message,
        },
        { status: 500 }
      )
    }

    // Save assistant response to database
    const assistantMessage = await createChatMessage(
      sessionId,
      user.id,
      'assistant',
      n8nResponse.reply
    )

    if (!assistantMessage) {
      return NextResponse.json(
        { error: 'Failed to save assistant message' },
        { status: 500 }
      )
    }

    // Auto-generate title from first user message if session doesn't have one
    if (!session.title && recentMessages.length === 1) {
      const title = message.substring(0, 40)
      await updateChatSessionTitle(sessionId, user.id, title)
    }

    // TODO: Adjust response format based on your n8n workflow output
    return NextResponse.json({
      reply: n8nResponse.reply,
      sources: n8nResponse.sources,
      metadata: n8nResponse.metadata,
    })
  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

