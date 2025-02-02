'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { User, Building2, Mail, Phone, FileText, MapPin, AlertCircle, Upload, X, File } from 'lucide-react'

type ClientType = 'INDIVIDUAL' | 'COMPANY'

interface SelectedFile {
  file: File
  progress: number
}

export default function NovoClientePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clientType, setClientType] = useState<ClientType>('INDIVIDUAL')
  const [documentType, setDocumentType] = useState<'RG' | 'CNH'>('RG')
  const [personalFiles, setPersonalFiles] = useState<SelectedFile[]>([])
  const [additionalFiles, setAdditionalFiles] = useState<SelectedFile[]>([])

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>, type: 'personal' | 'additional') {
    const files = Array.from(e.target.files || [])
    const selectedFiles = files.map(file => ({
      file,
      progress: 0
    }))

    if (type === 'personal') {
      setPersonalFiles(prev => [...prev, ...selectedFiles])
    } else {
      setAdditionalFiles(prev => [...prev, ...selectedFiles])
    }
  }

  function updateFileProgress(fileIndex: number, progress: number, type: 'personal' | 'additional') {
    if (type === 'personal') {
      setPersonalFiles(prev => {
        const newFiles = [...prev]
        newFiles[fileIndex] = { ...newFiles[fileIndex], progress }
        return newFiles
      })
    } else {
      setAdditionalFiles(prev => {
        const newFiles = [...prev]
        newFiles[fileIndex] = { ...newFiles[fileIndex], progress }
        return newFiles
      })
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(event.currentTarget)
      formData.set('type', clientType)
      formData.set('documentType', documentType)

      // Adicionar documentos pessoais
      personalFiles.forEach((selectedFile) => {
        formData.append('personalDocs', selectedFile.file)
      })

      // Adicionar documentos complementares
      additionalFiles.forEach((selectedFile) => {
        formData.append('additionalDocs', selectedFile.file)
      })

      // Enviar formulário
      const response = await fetch('/api/clients', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao cadastrar cliente')
      }

      // Redirecionar para a lista de clientes
      router.push('/clientes')
    } catch (error) {
      console.error('[CREATE_CLIENT_ERROR]', error)
      setError(error instanceof Error ? error.message : 'Ocorreu um erro ao cadastrar o cliente. Por favor, tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div>Carregando...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Novo Cliente</h1>

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

        <form onSubmit={handleSubmit} className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          {/* Tipo de Cliente */}
          <div className="space-y-6">
            <h4 className="font-medium text-gray-900">Tipo de Cliente</h4>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setClientType('INDIVIDUAL')}
                className={`flex items-center justify-center p-4 rounded-lg border-2 ${
                  clientType === 'INDIVIDUAL'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50'
                }`}
              >
                <User className="h-6 w-6 mr-2" />
                <span className="font-medium">Pessoa Física</span>
              </button>

              <button
                type="button"
                onClick={() => setClientType('COMPANY')}
                className={`flex items-center justify-center p-4 rounded-lg border-2 ${
                  clientType === 'COMPANY'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50'
                }`}
              >
                <Building2 className="h-6 w-6 mr-2" />
                <span className="font-medium">Pessoa Jurídica</span>
              </button>
            </div>
          </div>

          {/* Informações Básicas */}
          <div className="space-y-6">
            <h4 className="font-medium text-gray-900">Informações Básicas</h4>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  {clientType === 'INDIVIDUAL' ? 'Nome *' : 'Razão Social *'}
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  minLength={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Telefone
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="document" className="block text-sm font-medium text-gray-700">
                  {clientType === 'INDIVIDUAL' ? 'CPF *' : 'CNPJ *'}
                </label>
                <input
                  type="text"
                  name="document"
                  id="document"
                  required
                  maxLength={clientType === 'INDIVIDUAL' ? 11 : 14}
                  placeholder="Apenas números"
                  onChange={(e) => {
                    // Remove caracteres não numéricos
                    e.target.value = e.target.value.replace(/\D/g, '')
                    
                    // Limita o tamanho baseado no tipo de documento
                    if (clientType === 'INDIVIDUAL' && e.target.value.length > 11) {
                      e.target.value = e.target.value.slice(0, 11)
                    } else if (clientType === 'COMPANY' && e.target.value.length > 14) {
                      e.target.value = e.target.value.slice(0, 14)
                    }
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="documentType" className="block text-sm font-medium text-gray-700">
                  Tipo de Documento *
                </label>
                <select
                  id="documentType"
                  name="documentType"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as 'RG' | 'CNH')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="RG">RG</option>
                  <option value="CNH">CNH</option>
                </select>
              </div>
            </div>
          </div>

          {/* Upload de Documentos Pessoais */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">
              Documentos Pessoais (RG, CNH)
            </label>
            <div className="mt-2">
              <input
                type="file"
                multiple
                onChange={(e) => handleFileSelect(e, 'personal')}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary-50 file:text-primary-700
                  hover:file:bg-primary-100"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Faça upload dos seus documentos pessoais (RG, CNH)
            </p>
            {personalFiles.map((file, index) => (
              <div key={index} className="mt-2">
                <div className="text-sm text-gray-600">{file.file.name}</div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${file.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Upload de Documentos Complementares */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">
              Documentos Complementares
            </label>
            <div className="mt-2">
              <input
                type="file"
                multiple
                onChange={(e) => handleFileSelect(e, 'additional')}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary-50 file:text-primary-700
                  hover:file:bg-primary-100"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Faça upload de documentos adicionais (comprovante de residência, etc)
            </p>
            {additionalFiles.map((file, index) => (
              <div key={index} className="mt-2">
                <div className="text-sm text-gray-600">{file.file.name}</div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${file.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Endereço */}
          <div className="space-y-6">
            <h4 className="font-medium text-gray-900">Endereço</h4>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Endereço *
                </label>
                <input
                  type="text"
                  name="address"
                  id="address"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  Cidade *
                </label>
                <input
                  type="text"
                  name="city"
                  id="city"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  Estado *
                </label>
                <input
                  type="text"
                  name="state"
                  id="state"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                  CEP *
                </label>
                <input
                  type="text"
                  name="postalCode"
                  id="postalCode"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Cadastrando...' : 'Cadastrar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 