import { createServerClient } from './supabaseServer'
import { ChatSession, ChatMessage } from './types'

export async function getChatSessions(userId: string): Promise<ChatSession[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching sessions:', error)
    return []
  }

  return data || []
}

export async function getChatMessages(
  sessionId: string,
  userId: string
): Promise<ChatMessage[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching messages:', error)
    return []
  }

  return data || []
}

export async function createChatSession(
  userId: string,
  title?: string
): Promise<ChatSession | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({
      user_id: userId,
      title: title || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating session:', error)
    return null
  }

  return data
}

export async function updateChatSessionTitle(
  sessionId: string,
  userId: string,
  title: string
): Promise<boolean> {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('chat_sessions')
    .update({ title })
    .eq('id', sessionId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error updating session title:', error)
    return false
  }

  return true
}

export async function createChatMessage(
  sessionId: string,
  userId: string,
  role: 'user' | 'assistant' | 'system',
  content: string
): Promise<ChatMessage | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      session_id: sessionId,
      user_id: userId,
      role,
      content,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating message:', error)
    return null
  }

  // Update session updated_at
  await supabase
    .from('chat_sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', sessionId)
    .eq('user_id', userId)

  return data
}

export async function deleteChatSession(
  sessionId: string,
  userId: string
): Promise<boolean> {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting session:', error)
    return false
  }

  return true
}

