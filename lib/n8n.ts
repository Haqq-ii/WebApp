// Helper function to call n8n webhook
// TODO: Adjust payload/response format based on your n8n workflow requirements

export interface N8NRequestPayload {
  app: string
  user_id: string
  session_id: string
  message: string
  history?: Array<{ role: string; content: string }>
  metadata?: {
    timestamp: string
    source: string
    model?: string
  }
}

export interface N8NResponse {
  reply: string
  sources?: string[]
  metadata?: Record<string, unknown>
}

export async function callN8NWebhook(
  payload: N8NRequestPayload
): Promise<N8NResponse> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL
  const webhookSecret = process.env.N8N_WEBHOOK_SECRET

  if (!webhookUrl) {
    throw new Error('N8N_WEBHOOK_URL is not configured')
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  // TODO: If your n8n workflow requires HMAC signature verification,
  // implement it here and add the signature to headers
  if (webhookSecret) {
    headers['x-webhook-secret'] = webhookSecret
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `N8N webhook error: ${response.status} ${response.statusText} - ${errorText}`
      )
    }

    const data = await response.json()

    // TODO: Adjust response parsing based on your n8n workflow output format
    // Expected minimal format: { reply: "..." }
    if (!data.reply) {
      throw new Error('Invalid response from n8n: missing "reply" field')
    }

    return data as N8NResponse
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('N8N webhook request timeout')
      }
      throw error
    }
    throw new Error('Unknown error calling n8n webhook')
  }
}

