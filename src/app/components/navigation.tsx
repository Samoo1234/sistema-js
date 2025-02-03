import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  FileText, 
  Users, 
  BarChart2, 
  Settings,
  LayoutDashboard
} from 'lucide-react'

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="mt-6">
      <div className="border-b border-gray-200">
        <div className="-mb-px flex space-x-8">
          <Link
            href="/dashboard"
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
              pathname === '/dashboard'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Visão Geral
          </Link>
          <Link
            href="/clientes"
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
              pathname.startsWith('/clientes')
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="mr-2 h-4 w-4" />
            Clientes
          </Link>
          <Link
            href="/processos"
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
              pathname.startsWith('/processos')
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="mr-2 h-4 w-4" />
            Processos
          </Link>
          <Link
            href="/relatorios"
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
              pathname.startsWith('/relatorios')
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BarChart2 className="mr-2 h-4 w-4" />
            Relatórios
          </Link>
          <Link
            href="/configuracoes"
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
              pathname.startsWith('/configuracoes')
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </Link>
        </div>
      </div>
    </nav>
  )
} 