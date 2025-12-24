'use client'

import { ChatSession } from '@/lib/types'

function formatDistanceToNow(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return date.toLocaleDateString()
}

interface SessionListProps {
  sessions: ChatSession[]
  activeSessionId: string | null
  onSelectSession: (sessionId: string) => void
  onDeleteSession: (sessionId: string) => void
  onNewChat: () => void
}

export default function SessionList({
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onNewChat,
}: SessionListProps) {
  return (
    <div className="flex h-full flex-col">
      <button
        onClick={onNewChat}
        className="mx-4 mt-4 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        + New Chat
      </button>
      <div className="mt-4 flex-1 overflow-y-auto px-2">
        {sessions.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500">
            No chat sessions yet
          </div>
        ) : (
          <div className="space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-gray-100 ${
                  activeSessionId === session.id ? 'bg-gray-100' : ''
                }`}
              >
                <button
                  onClick={() => onSelectSession(session.id)}
                  className="flex-1 truncate text-left"
                >
                  <div className="font-medium text-gray-900">
                    {session.title || 'New Chat'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(session.updated_at), {
                      addSuffix: true,
                    })}
                  </div>
                </button>
                <button
                  onClick={() => onDeleteSession(session.id)}
                  className="ml-2 opacity-0 text-gray-400 hover:text-red-600 group-hover:opacity-100"
                  title="Delete session"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

