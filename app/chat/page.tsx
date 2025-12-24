'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ChatLayout from '@/components/ChatLayout'
import { ChatSession, ChatMessage } from '@/lib/types'
import { createClient } from '@/lib/supabaseClient'

export default function ChatPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (!isInitializing) {
      loadSessions()
    }
  }, [isInitializing])

  useEffect(() => {
    if (activeSessionId) {
      loadMessages(activeSessionId)
      
      // Auto-refresh messages setiap 2 detik untuk session aktif
      // Ini memastikan assistant message muncul meskipun sudah ada di DB
      const interval = setInterval(() => {
        loadMessages(activeSessionId)
      }, 2000)
      
      return () => clearInterval(interval)
    } else {
      setMessages([])
    }
  }, [activeSessionId])

  const checkAuth = async () => {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      router.push('/auth')
      return
    }
    setIsInitializing(false)
  }

  const loadSessions = async () => {
    try {
      const response = await fetch("/api/sessions", { cache: "no-store" });

      if (response.ok) {
        const data = await response.json()
        setSessions(data)
      }
    } catch (error) {
      console.error('Error loading sessions:', error)
    }
  }

  const loadMessages = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/messages`, {
        cache: "no-store",
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
      if (response.ok) {
        const data = await response.json();
        // Pastikan data adalah array dan update state
        if (Array.isArray(data)) {
          setMessages(data);
          console.log(`Loaded ${data.length} messages for session ${sessionId}`);
        }
      } else {
        console.error(`Failed to load messages: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  // Helper: ambil messages terbaru (return data) + update state
  const fetchLatestMessages = async (sessionId: string) => {
    const response = await fetch(`/api/sessions/${sessionId}/messages`, {
      cache: "no-store",
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
    if (!response.ok) {
      console.error(`Failed to fetch latest messages: ${response.status}`);
      return null;
    }
    const data: ChatMessage[] = await response.json();
    if (Array.isArray(data)) {
      setMessages(data);
      return data;
    }
    return null;
  };

  const handleNewChat = async (): Promise<ChatSession | null> => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
      })
      if (response.ok) {
        const newSession: ChatSession = await response.json()
        setSessions((prev) => [newSession, ...prev])
        setActiveSessionId(newSession.id)
        setMessages([])
        return newSession
      }
    } catch (error) {
      console.error('Error creating session:', error)
    }
    return null
  }

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId)
  }

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId))
        if (activeSessionId === sessionId) {
          setActiveSessionId(null)
          setMessages([])
        }
      }
    } catch (error) {
      console.error('Error deleting session:', error)
    }
  }

  const handleSendMessage = async (content: string) => {
    let sessionId = activeSessionId

    // Kalau belum ada session, buat dulu
    if (!sessionId) {
      const newSession = await handleNewChat()
      if (!newSession) return
      sessionId = newSession.id
    }

    setIsLoading(true)

    // tampilkan pesan user dulu (optimistic UI)
    const userMessage: ChatMessage = {
      id: 'temp-' + Date.now(),
      session_id: sessionId,
      user_id: '',
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    }

    // FIX: gunakan functional update untuk menghindari stale state
    setMessages((prev) => [...prev, userMessage])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message: content,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      // response /api/chat bisa balik duluan sebelum n8n selesai insert assistant.
      // Jadi: kita polling sampai assistant message masuk DB.
      // Tunggu sebentar dulu untuk memastikan user message sudah ter-save
      await new Promise((r) => setTimeout(r, 500))
      
      const maxTries = 20
      const delayMs = 600

      let gotAssistant = false
      let lastUserMessageTime: number | null = null

      for (let i = 0; i < maxTries; i++) {
        const latest = await fetchLatestMessages(sessionId)
        if (latest && latest.length > 0) {
          // Cari user message terakhir yang sudah ter-save (bukan temporary)
          const savedUserMessages = latest.filter(m => m.role === 'user' && !m.id.startsWith('temp-'))
          if (savedUserMessages.length > 0) {
            const lastUserMsg = savedUserMessages[savedUserMessages.length - 1]
            lastUserMessageTime = new Date(lastUserMsg.created_at).getTime()
            
            // Cek apakah ada assistant message yang dibuat setelah user message terakhir
            const assistantMsg = latest.find(
              (m) => 
                m.role === 'assistant' && 
                lastUserMessageTime !== null &&
                new Date(m.created_at).getTime() >= lastUserMessageTime
            )
            if (assistantMsg) {
              gotAssistant = true
              console.log('Found assistant message:', assistantMsg.content.substring(0, 50))
              break
            }
          } else {
            // Kalau belum ada user message yang ter-save, cek apakah ada assistant message baru
            const assistantMsgs = latest.filter(m => m.role === 'assistant')
            if (assistantMsgs.length > 0) {
              // Ada assistant message, mungkin user message sudah ter-save sebelumnya
              gotAssistant = true
              break
            }
          }
        }
        await new Promise((r) => setTimeout(r, delayMs))
      }

      // fallback: kalau belum juga, minimal load sekali lagi
      if (!gotAssistant) {
        console.log('Polling timeout, loading messages as fallback')
        await loadMessages(sessionId)
      } else {
        // Pastikan messages ter-update dengan benar
        await fetchLatestMessages(sessionId)
      }

      // Update session title kalau ini message pertama (gunakan STATE TERBARU)
      const latestAfter = await fetchLatestMessages(sessionId)
      const isFirstUserMessage =
        latestAfter?.filter((m) => m.role === 'user').length === 1

      if (isFirstUserMessage) {
        const title = content.substring(0, 40)
        await fetch(`/api/sessions/${sessionId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title }),
        })
        await loadSessions()
      }
    } catch (error) {
      console.error('Error sending message:', error)

      // rollback optimistic message (balik ke messages terakhir dari DB)
      await loadMessages(sessionId)
    } finally {
      setIsLoading(false)
    }
  }

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <ChatLayout
      sessions={sessions}
      messages={messages}
      activeSessionId={activeSessionId}
      isLoading={isLoading}
      onSelectSession={handleSelectSession}
      onDeleteSession={handleDeleteSession}
      onNewChat={handleNewChat}
      onSendMessage={handleSendMessage}
      onSessionsChange={loadSessions}
    />
  )
}

