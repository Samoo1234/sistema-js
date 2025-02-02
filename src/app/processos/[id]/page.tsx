'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react'

interface ProcessHistory {
  id: string
  status: string
  observation: string
  createdAt: string
  createdBy: string
}

interface Process {
  id: string
  title: string
  description: string
  status: string
  priority: string
  clientName: string
  clientEmail: string
  createdAt: string
  history: ProcessHistory[]
}

const statusMessages = {
  CADASTRO_REALIZADO: 'Cadastro Realizado',
  EM_ANALISE_DOCUMENTOS: 'Em Análise de Documentos',
  DOCUMENTOS_APROVADOS: 'Documentos Aprovados',
  DOCUMENTOS_REPROVADOS: 'Documentos Reprovados',
  DECISAO_FINAL_APROVADA: 'Decisão Final Aprovada',
  DECISAO_FINAL_REPROVADA: 'Decisão Final Reprovada'
}

const statusIcons = {
  CADASTRO_REALIZADO: Clock,
  EM_ANALISE_DOCUMENTOS: Clock,
  DOCUMENTOS_APROVADOS: CheckCircle2,
  DOCUMENTOS_REPROVADOS: XCircle,
  DECISAO_FINAL_APROVADA: CheckCircle2,
  DECISAO_FINAL_REPROVADA: XCircle
}

const statusColors = {
  CADASTRO_REALIZADO: 'bg-gray-500',
  EM_ANALISE_DOCUMENTOS: 'bg-yellow-500',
  DOCUMENTOS_APROVADOS: 'bg-green-500',
  DOCUMENTOS_REPROVADOS: 'bg-red-500',
  DECISAO_FINAL_APROVADA: 'bg-green-500',
  DECISAO_FINAL_REPROVADA: 'bg-red-500'
}

const priorityColors = {
  LOW: 'bg-blue-100 text-blue-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-red-100 text-red-800'
}

const priorityMessages = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta'
}

export default function ProcessoDetalhesPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [process, setProcess] = useState<Process | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploadingFiles, setUploadingFiles] = useState<{
    file: File;
    progress: number;
  }[]>([])

  async function loadProcess() {
    try {
      const response = await fetch(`/api/processes/${params.id}`)
      if (!response.ok) {
        throw new Error('Erro ao carregar processo')
      }
      const data = await response.json()
      setProcess(data)
    } catch (error) {
      console.error('Erro ao carregar processo:', error)
      setError('Não foi possível carregar os dados do processo')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProcess()
  }, [params.id])

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || [])
    
    setUploadingFiles(files.map(file => ({
      file,
      progress: 0
    })))

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData()
      formData.append('file', files[i])
      formData.append('processId', params.id)

      try {
        const xhr = new XMLHttpRequest()
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded * 100) / e.total)
            setUploadingFiles(prev => {
              const newFiles = [...prev]
              newFiles[i] = { ...newFiles[i], progress }
              return newFiles
            })
          }
        })

        await new Promise((resolve, reject) => {
          xhr.open('POST', '/api/processes/upload')
          
          xhr.onload = () => {
            if (xhr.status === 200) {
              resolve(xhr.response)
            } else {
              reject(xhr.statusText)
            }
          }
          
          xhr.onerror = () => reject(xhr.statusText)
          xhr.send(formData)
        })

      } catch (error) {
        console.error('Erro ao fazer upload:', error)
        setError('Erro ao fazer upload do arquivo')
      }
    }

    // Recarrega os dados do processo após o upload
    loadProcess()
  }

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
          {/* Cabeçalho */}
          <div className="px-4 py-5 sm:px-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {process.title}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Detalhes e andamento do processo
                </p>
              </div>
              <span
                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                  priorityColors[process.priority as keyof typeof priorityColors]
                }`}
              >
                {priorityMessages[process.priority as keyof typeof priorityMessages]}
              </span>
            </div>
          </div>

          {/* Informações do Cliente */}
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Cliente</dt>
                <dd className="mt-1 text-sm text-gray-900">{process.clientName}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{process.clientEmail}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Descrição</dt>
                <dd className="mt-1 text-sm text-gray-900">{process.description}</dd>
              </div>
            </dl>
          </div>

          {/* Timeline */}
          <div className="border-t border-gray-200">
            <div className="bg-gray-50 px-4 py-5 sm:px-6">
              <div className="flow-root">
                <ul role="list" className="-mb-8">
                  {process.history.map((event, eventIdx) => {
                    const Icon = statusIcons[event.status as keyof typeof statusIcons] || Clock
                    const colorClass = statusColors[event.status as keyof typeof statusColors] || 'bg-gray-400'
                    
                    return (
                      <li key={event.id}>
                        <div className="relative pb-8">
                          {eventIdx !== process.history.length - 1 ? (
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

        {/* Upload de Documentos */}
        <div className="mt-8 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Documentos do Processo
            </h3>
            
            <div className="mt-4">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary-50 file:text-primary-700
                  hover:file:bg-primary-100"
              />
            </div>

            {/* Barra de Progresso */}
            {uploadingFiles.map((file, index) => (
              <div key={index} className="mt-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{file.file.name}</span>
                  <span>{file.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                  <div
                    className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 