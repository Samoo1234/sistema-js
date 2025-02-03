import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { 
  FileText, 
  Users, 
  BarChart2, 
  Settings,
  Bell,
  Search
} from 'lucide-react'
import { query } from '@/lib/db'

interface RecentActivity {
  process_title: string
  status: string
  observation: string | null
  created_at: Date
  client_name: string
}

interface DashboardData {
  totalProcesses: number
  totalClients: number
  activeProcesses: number
  completedProcesses: number
  recentActivities: RecentActivity[]
}

async function getDashboardData(userEmail: string): Promise<DashboardData> {
  // Primeiro vamos pegar o ID do usuário
  const { rows: userRows } = await query(
    'SELECT id FROM app.users WHERE email = $1',
    [userEmail]
  )
  const userId = userRows[0].id

  const { rows: totalProcesses } = await query(
    'SELECT COUNT(*) as total FROM app.processes WHERE user_id = $1',
    [userId]
  )

  const { rows: totalClients } = await query(
    'SELECT COUNT(*) as total FROM app.clients WHERE user_id = $1',
    [userId]
  )

  const { rows: activeProcesses } = await query(
    `SELECT COUNT(*) as total 
    FROM app.processes 
    WHERE user_id = $1 
    AND status NOT IN ('DOCUMENTOS_APROVADOS', 'DOCUMENTOS_REPROVADOS')`,
    [userId]
  )

  const { rows: completedProcesses } = await query(
    `SELECT COUNT(*) as total 
    FROM app.processes 
    WHERE user_id = $1 
    AND status IN ('DOCUMENTOS_APROVADOS', 'DOCUMENTOS_REPROVADOS')`,
    [userId]
  )

  const { rows: recentActivities } = await query(
    `SELECT 
      p.title as process_title,
      ph.status,
      ph.observation,
      ph.created_at,
      c.name as client_name
    FROM app.process_history ph
    JOIN app.processes p ON p.id = ph.process_id
    JOIN app.clients c ON c.id = p.client_id
    WHERE p.user_id = $1
    ORDER BY ph.created_at DESC
    LIMIT 5`,
    [userId]
  )

  return {
    totalProcesses: Number(totalProcesses[0].total),
    totalClients: Number(totalClients[0].total),
    activeProcesses: Number(activeProcesses[0].total),
    completedProcesses: Number(completedProcesses[0].total),
    recentActivities
  }
}

const statusMessages = {
  CADASTRO_REALIZADO: 'Cadastro Realizado',
  EM_ANALISE_DOCUMENTOS: 'Em Análise de Documentos',
  DOCUMENTOS_APROVADOS: 'Documentos Aprovados',
  DOCUMENTOS_REPROVADOS: 'Documentos Reprovados'
} as const

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const dashboardData = await getDashboardData(session.user.email!)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com perfil e notificações */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">SGP</h1>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Search className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-500 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-400" />
              </button>
              <div className="flex items-center">
                <img
                  className="h-8 w-8 rounded-full"
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name || '')}`}
                  alt={session.user.name || ''}
                />
                <span className="ml-3 text-sm font-medium text-gray-700">
                  {session.user.name}
                </span>
              </div>
            </div>
          </div>

          {/* Navegação por abas */}
          <nav className="mt-6">
            <div className="border-b border-gray-200">
              <div className="-mb-px flex space-x-8">
                <Link
                  href="/dashboard"
                  className="border-primary-500 text-primary-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                >
                  Visão Geral
                </Link>
                <Link
                  href="/clientes"
                  className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Clientes
                </Link>
                <Link
                  href="/processos"
                  className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Processos
                </Link>
                <Link
                  href="/relatorios"
                  className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center"
                >
                  <BarChart2 className="mr-2 h-4 w-4" />
                  Relatórios
                </Link>
                <Link
                  href="/configuracoes"
                  className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card Total de Processos */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-blue-700 truncate">
                      Total de Processos
                    </dt>
                    <dd className="text-lg font-medium text-blue-900">
                      {dashboardData.totalProcesses}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-blue-100/50 px-5 py-3">
              <div className="text-sm">
                <Link
                  href="/processos"
                  className="font-medium text-blue-700 hover:text-blue-900"
                >
                  Ver todos
                </Link>
              </div>
            </div>
          </div>

          {/* Card Total de Clientes */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-green-700 truncate">
                      Total de Clientes
                    </dt>
                    <dd className="text-lg font-medium text-green-900">
                      {dashboardData.totalClients}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-green-100/50 px-5 py-3">
              <div className="text-sm">
                <Link
                  href="/clientes"
                  className="font-medium text-green-700 hover:text-green-900"
                >
                  Ver todos
                </Link>
              </div>
            </div>
          </div>

          {/* Card Processos Ativos */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart2 className="h-6 w-6 text-amber-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-amber-700 truncate">
                      Processos Ativos
                    </dt>
                    <dd className="text-lg font-medium text-amber-900">
                      {dashboardData.activeProcesses}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-amber-100/50 px-5 py-3">
              <div className="text-sm">
                <Link
                  href="/relatorios"
                  className="font-medium text-amber-700 hover:text-amber-900"
                >
                  Ver relatório
                </Link>
              </div>
            </div>
          </div>

          {/* Card Processos Concluídos */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-purple-700 truncate">
                      Processos Concluídos
                    </dt>
                    <dd className="text-lg font-medium text-purple-900">
                      {dashboardData.completedProcesses}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-purple-100/50 px-5 py-3">
              <div className="text-sm">
                <Link
                  href="/relatorios"
                  className="font-medium text-purple-700 hover:text-purple-900"
                >
                  Ver relatório
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Área de atividades recentes */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Atividades Recentes</h2>
          <div className="mt-4 bg-gradient-to-br from-white to-gray-50 shadow rounded-lg">
            <div className="p-6">
              {dashboardData.recentActivities.length === 0 ? (
                <div className="text-center text-gray-500">
                  Nenhuma atividade recente
                </div>
              ) : (
                <div className="flow-root">
                  <ul role="list" className="-mb-8">
                    {dashboardData.recentActivities.map((activity, activityIdx) => (
                      <li key={activity.created_at.toString()}>
                        <div className="relative pb-8">
                          {activityIdx !== dashboardData.recentActivities.length - 1 ? (
                            <span
                              className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                              aria-hidden="true"
                            />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center ring-8 ring-white">
                                <FileText className="h-4 w-4 text-white" />
                              </span>
                            </div>
                            <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                              <div>
                                <p className="text-sm text-gray-500">
                                  Processo <span className="font-medium text-gray-900">{activity.process_title}</span> do cliente{' '}
                                  <span className="font-medium text-gray-900">{activity.client_name}</span> teve status alterado para{' '}
                                  <span className="font-medium text-gray-900">
                                    {statusMessages[activity.status as keyof typeof statusMessages]}
                                  </span>
                                </p>
                                {activity.observation && (
                                  <p className="mt-1 text-sm text-gray-500">{activity.observation}</p>
                                )}
                              </div>
                              <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                {new Date(activity.created_at).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 