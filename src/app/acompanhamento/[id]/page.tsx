'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react'

interface ProcessHistory {
  id: string
  status: string
  observation: string
  createdAt: string
}

interface Process {
  id: string
  title: string
  status: string
  clientName: string
  clientEmail: string
  client_id: number
  history: ProcessHistory[]
}

const statusColors = {
  CADASTRO_REALIZADO: 'bg-blue-500',
  EM_ANALISE_DOCUMENTOS: 'bg-yellow-500',
  DOCUMENTOS_APROVADOS: 'bg-green-500',
  DOCUMENTOS_REPROVADOS: 'bg-red-500'
}

const statusIcons = {
  CADASTRO_REALIZADO: Clock,
  EM_ANALISE_DOCUMENTOS: Clock,
  DOCUMENTOS_APROVADOS: CheckCircle2,
  DOCUMENTOS_REPROVADOS: XCircle
}

const statusMessages = {
  CADASTRO_REALIZADO: 'Cadastro Realizado',
  EM_ANALISE_DOCUMENTOS: 'Em Análise de Documentos',
  DOCUMENTOS_APROVADOS: 'Documentos Aprovados',
  DOCUMENTOS_REPROVADOS: 'Documentos Reprovados'
}

export default function ProcessoDetalhesPage({ params }: { params: { id: string } }) {
  const [process, setProcess] = useState<Process | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (process?.history) {
    }
  }, [process?.history]);

  useEffect(() => {
    async function loadProcess() {
      try {
        const response = await fetch(`/api/processes/${params.id}/public`)
        
        if (!response.ok) {
          throw new Error('Erro ao carregar processo')
        }

        const data = await response.json()
        setProcess(data)
      } catch (error) {
        console.error('[LOAD_PROCESS_ERROR]', error)
        setError('Não foi possível carregar os dados do processo')
      } finally {
        setLoading(false)
      }
    }

    loadProcess()
    const intervalId = setInterval(loadProcess, 10000)
    return () => clearInterval(intervalId)
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div>Carregando...</div>
        </div>
      </div>
    )
  }

  if (error || !process) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {error || 'Processo não encontrado'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            {/* Cabeçalho */}
            <div className="mb-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {process.title}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Detalhes e andamento do processo
              </p>
            </div>

            {/* Informações do Cliente */}
            <div className="mb-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Nome</dt>
                  <dd className="mt-1 text-sm text-gray-900">{process.clientName}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{process.clientEmail}</dd>
                </div>
              </dl>
            </div>

            {/* Status Atual */}
            <div className="mb-6">
              <div className="flex items-center space-x-2">
                <dt className="text-sm font-medium text-gray-500">Status Atual:</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {statusMessages[process.status as keyof typeof statusMessages]}
                </dd>
              </div>
            </div>

            {/* Timeline */}
            <div className="flow-root min-h-[100px]">
              <ul role="list" className="flex justify-between items-start">
                {process.history && process.history.length > 0 ? (
                  [...process.history].reverse().map((event, eventIdx) => {
                    const Icon = statusIcons[event.status as keyof typeof statusIcons] || Clock;
                    const colorClass = statusColors[event.status as keyof typeof statusColors] || 'bg-gray-400';

                    return (
                      <li key={event.id} className="flex-1 relative pt-2">
                        <div className="relative flex flex-col items-center group">
                          {eventIdx !== (process.history?.length || 0) - 1 ? (
                            <span
                              className="absolute left-1/2 top-6 w-full h-0.5 bg-gray-200 -translate-x-1/2"
                              aria-hidden="true"
                            />
                          ) : null}
                          <span className={`relative z-10 h-12 w-12 rounded-full flex items-center justify-center ring-4 ring-white ${colorClass}`}>
                            <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                          </span>
                          <div className="mt-3 text-center w-32 mx-auto">
                            <p className="text-sm text-gray-500 font-medium min-h-[40px] flex items-center justify-center">
                              {statusMessages[event.status as keyof typeof statusMessages]}
                            </p>
                            {event.observation && (
                              <p className="mt-1 text-xs text-gray-500 truncate max-w-[120px] hover:whitespace-normal hover:text-clip group-hover:max-w-none">
                                {event.observation}
                              </p>
                            )}
                            <p className="mt-1 text-xs text-gray-400">
                              {new Date(event.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })
                ) : (
                  <li>
                    <div className="relative pb-8 bg-white p-4 rounded-lg">
                      <div className="flex items-center justify-center">
                        <p className="text-sm text-gray-500">Nenhum evento encontrado.</p>
                      </div>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 