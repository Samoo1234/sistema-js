export type Client = {
  id: number
  name: string
  email: string | null
  phone: string | null
  document: string | null
  type: 'INDIVIDUAL' | 'COMPANY'
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED'
  createdAt: string
} 