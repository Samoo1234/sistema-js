'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface Client {
  id: string
  name: string
}

export default function NovoProcessoPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [priority, setPriority] = useState('MEDIUM')
  const [clients, setClients] = useState<Client[]>([])
  const [uploadingFiles, setUploadingFiles] = useState<{
    file: File;
    progress: number;
  }[]>([])
  const [success, setSuccess] = useState<{
    loginToken: string
    password: string
  } | null>(null)

  useEffect(() => {
    async function loadClients() {
      try {
        const response = await fetch('/api/clients')
        if (!response.ok) {
          throw new Error('Erro ao carregar clientes')
        }
        const data = await response.json()
        setClients(data)
      } catch (error) {
        console.error('Erro ao carregar clientes:', error)
      }
    }

    loadClients()
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(event.currentTarget)
      formData.set('priority', priority)

      // Enviar formulário
      const response = await fetch('/api/processes', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao cadastrar processo')
      }

      const data = await response.json()
      setSuccess(data.credentials)

      // Redirecionar para a lista de processos após 5 segundos
      setTimeout(() => {
        router.push('/processos')
      }, 5000)
    } catch (error) {
      console.error('[CREATE_PROCESS_ERROR]', error)
      setError(error instanceof Error ? error.message : 'Ocorreu um erro ao cadastrar o processo. Por favor, tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Novo Processo</h1>

        {error && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mt-4 bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex flex-col">
              <p className="text-sm text-green-700 font-medium">
                Processo criado com sucesso! Guarde as credenciais de acesso:
              </p>
              <p className="mt-2 text-sm text-green-700">
                Token: <span className="font-mono font-bold">{success.loginToken}</span>
              </p>
              <p className="text-sm text-green-700">
                Senha: <span className="font-mono font-bold">{success.password}</span>
              </p>
              <p className="mt-2 text-sm text-green-700">
                Você será redirecionado em alguns segundos...
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Título
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="title"
                  id="title"
                  required
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
                Cliente
              </label>
              <div className="mt-1">
                <select
                  id="clientId"
                  name="clientId"
                  required
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                Prioridade
              </label>
              <div className="mt-1">
                <select
                  id="priority"
                  name="priority"
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="LOW">Baixa</option>
                  <option value="MEDIUM">Média</option>
                  <option value="HIGH">Alta</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Criando...' : 'Criar Processo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 