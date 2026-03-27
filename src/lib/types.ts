export type DocumentItem = {
  id: string
  name: string
  sizeBytes?: number | null
  chunks?: number | null
  status?: string | null
  uploadedAt?: string | null
}

export type ChatRole = 'user' | 'assistant'

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  createdAt?: string | null
}

