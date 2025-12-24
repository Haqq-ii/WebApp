'use client'

import { useState, KeyboardEvent } from 'react'
import LoadingDots from './LoadingDots'

interface MessageInputProps {
  onSend: (message: string) => void
  isLoading?: boolean
  disabled?: boolean
}

export default function MessageInput({
  onSend,
  isLoading = false,
  disabled = false,
}: MessageInputProps) {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (message.trim() && !isLoading && !disabled) {
      onSend(message.trim())
      setMessage('')
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-4">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            disabled={disabled || isLoading}
            rows={1}
            className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 disabled:cursor-not-allowed disabled:bg-gray-50"
            style={{ minHeight: '44px', maxHeight: '200px' }}
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || isLoading || disabled}
            className="rounded-lg bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? <LoadingDots /> : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}

