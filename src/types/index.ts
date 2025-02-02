export interface ProcessHistory {
  id: string
  status: string
  observation?: string
  attachments?: string[]
  createdBy: string
  createdAt: string
}

export interface Process {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  login_token: string
  password: string
  created_at: string
  updated_at: string
  user_id: number
  client_id?: number
  clientName?: string
  clientEmail?: string
  history?: ProcessHistory[]
} 