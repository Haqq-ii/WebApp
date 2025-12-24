'use client'

import { ChatSession, ChatMessage } from '@/lib/types'
import Sidebar from './Sidebar'
import MessageList from './MessageList'
import MessageInput from './MessageInput'

interface ChatLayoutProps {
  sessions: ChatSession[]
  messages: ChatMessage[]
  activeSessionId: string | null
  isLoading?: boolean
  onSelectSession: (sessionId: string) => void
  onDeleteSession: (sessionId: string) => void
  onNewChat: () => void
  onSendMessage: (message: string) => void
  onSessionsChange: () => void
}

export default function ChatLayout({
  sessions,
  messages,
  activeSessionId,
  isLoading = false,
  onSelectSession,
  onDeleteSession,
  onNewChat,
  onSendMessage,
  onSessionsChange,
}: ChatLayoutProps) {
  return (
    <div className="flex h-screen bg-white">
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={onSelectSession}
        onDeleteSession={onDeleteSession}
        onNewChat={onNewChat}
        onSessionsChange={onSessionsChange}
      />
      <div className="flex flex-1 flex-col lg:ml-0">
        <MessageList messages={messages} isLoading={isLoading} />
        <MessageInput onSend={onSendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
}

