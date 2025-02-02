import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ProcessStatusManagerProps {
  processId: string
  currentStatus: string
}

export function ProcessStatusManager({ processId, currentStatus }: ProcessStatusManagerProps) {
  const [loading, setLoading] = useState(false)
  const [observation, setObservation] = useState('')
  const router = useRouter()

  const nextStatus = {
    CADASTRO_REALIZADO: 'EM_ANALISE_DOCUMENTOS',
    EM_ANALISE_DOCUMENTOS: ['DOCUMENTOS_APROVADOS', 'DOCUMENTOS_REPROVADOS']
  }

  const statusLabels = {
    EM_ANALISE_DOCUMENTOS: 'Iniciar Análise',
    DOCUMENTOS_APROVADOS: 'Aprovar Documentos',
    DOCUMENTOS_REPROVADOS: 'Reprovar Documentos'
  }

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setLoading(true)

      const response = await fetch(`/api/processes/${processId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          observation
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar status')
      }

      setObservation('')
      router.refresh()
    } catch (error) {
      console.error('[UPDATE_STATUS_ERROR]', error)
      alert('Erro ao atualizar status do processo')
    } finally {
      setLoading(false)
    }
  }

  const availableStatus = nextStatus[currentStatus as keyof typeof nextStatus]
  if (!availableStatus) return null

  return (
    <div className="mt-6 border-t border-gray-200 px-4 py-5 sm:px-6">
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Atualizar Status</h4>
        
        <div>
          <label htmlFor="observation" className="block text-sm font-medium text-gray-700">
            Observação
          </label>
          <textarea
            id="observation"
            name="observation"
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          {Array.isArray(availableStatus) ? (
            availableStatus.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => handleUpdateStatus(status)}
                disabled={loading}
                className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  status === 'DOCUMENTOS_APROVADOS'
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                }`}
              >
                {statusLabels[status as keyof typeof statusLabels]}
              </button>
            ))
          ) : (
            <button
              type="button"
              onClick={() => handleUpdateStatus(availableStatus)}
              disabled={loading}
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {statusLabels[availableStatus as keyof typeof statusLabels]}
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 