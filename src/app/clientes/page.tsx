'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import ClientList from '@/components/client-list'

type Client = {
  id: string
  name: string
  email: string | null
  phone: string | null
  document: string | null
  type: 'INDIVIDUAL' | 'COMPANY'
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED'
  createdAt: string
}

export default function ClientesPage() {
  const { data: session, status } = useSession()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login')
    }

    if (status === 'authenticated') {
      fetch('/api/clients')
        .then(res => res.json())
        .then(data => {
          setClients(data)
          setLoading(false)
        })
        .catch(error => {
          console.error('Erro ao carregar clientes:', error)
          setLoading(false)
        })
    }
  }, [status])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div>Carregando...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ClientList initialClients={clients} />
      </div>
    </div>
  )
} 