'use client'

import { useEffect, useState } from 'react'
import { ProcessStatusManager } from '@/components/ProcessStatusManager'
import { ProcessHistory } from '@/types'
import { AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react'

interface Document {
  id: string
  name: string
  type: string
  createdAt: string
}

interface Process {
  id: string
  title: string
  status: string
  priority: string
  clientName: string
  clientEmail: string
  history?: ProcessHistory[]
  documents?: Document[]
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

  useEffect(() => {
    async function loadProcess() {
      try {
        const response = await fetch(`/api/processes/${params.id}`)
        const data = await response.json()
        console.log('DEBUG - Dados do processo:', data);
        setProcess(data)
      } catch (error) {
        console.error('[LOAD_PROCESS_ERROR]', error)
      } finally {
        setLoading(false)
      }
    }

    loadProcess()
    // Atualiza a cada 2 segundos
    const intervalId = setInterval(loadProcess, 2000)
    
    // Limpa o intervalo quando o componente for desmontado
    return () => clearInterval(intervalId)
  }, [params.id])

  if (loading) return <div>Carregando...</div>
  if (!process) return <div>Processo não encontrado</div>

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {process.title}
          </h3>
          
          {/* Informações do Cliente */}
          <div className="mt-5 border-t border-gray-200">
            <dl className="divide-y divide-gray-200">
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Cliente</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {process.clientName}
                </dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {process.clientEmail}
                </dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {statusMessages[process.status as keyof typeof statusMessages]}
                </dd>
              </div>
            </dl>
          </div>

          {/* Lista de Documentos */}
          <div className="mt-6 border-t border-gray-200">
            <h4 className="text-lg font-medium leading-6 text-gray-900 mt-4">Documentos do Cliente</h4>
            <div className="mt-4">
              {(process.documents && process.documents.length > 0) ? (
                <ul className="divide-y divide-gray-200">
                  {process.documents.map((doc) => (
                    <li key={doc.id} className="py-4 flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                        <span className="ml-2 text-sm text-gray-500">({doc.type})</span>
                      </div>
                      <a
                        href={`/api/documents/${doc.id}`}
                        download
                        className="ml-4 px-3 py-1 text-sm font-medium text-primary-600 hover:text-primary-700 rounded-md hover:bg-primary-50"
                      >
                        Download
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Nenhum documento encontrado.</p>
              )}
            </div>
          </div>

          {/* Gerenciador de Status */}
          <ProcessStatusManager 
            processId={process.id} 
            currentStatus={process.status} 
          />

          {/* Timeline */}
          <div className="mt-6 border-t border-gray-200">
            <div className="flow-root">
              <ul role="list" className="-mb-8">
                {process.history?.map((event, eventIdx) => {
                  const Icon = statusIcons[event.status as keyof typeof statusIcons] || Clock
                  const colorClass = statusColors[event.status as keyof typeof statusColors] || 'bg-gray-400'
                  
                      return (
                        <li key={event.id}>
                          <div className="relative pb-8">
                        {eventIdx !== (process.history?.length || 0) - 1 ? (
                              <span
                                className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                aria-hidden="true"
                              />
                            ) : null}
                            <div className="relative flex space-x-3">
                              <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${colorClass}`}>
                              <Icon className="h-5 w-5 text-white" aria-hidden="true" />
                                </span>
                              </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                <div>
                                  <p className="text-sm text-gray-500">
                                {statusMessages[event.status as keyof typeof statusMessages]}
                              </p>
                                    {event.observation && (
                                <p className="mt-1 text-sm text-gray-900">
                                  {event.observation}
                                </p>
                              )}
                                </div>
                            <div className="whitespace-nowrap text-right text-sm text-gray-500">
                              {new Date(event.createdAt).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 