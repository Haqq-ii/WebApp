'use client'

import { ChatMessage } from '@/lib/types'
import MessageBubble from './MessageBubble'
import LoadingDots from './LoadingDots'

interface MessageListProps {
  messages: ChatMessage[]
  isLoading?: boolean
}

export default function MessageList({
  messages,
  isLoading,
}: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="mx-auto max-w-3xl">
        {messages.length === 0 && !isLoading ? (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <div className="mb-4 text-6xl">👋</div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Welcome to AI Chat
              </h3>
              <p className="text-sm text-gray-500">
                Start a conversation by typing a message below
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-gray-100 px-4 py-2">
                  <LoadingDots />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

