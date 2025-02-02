'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Bell, User, Search } from 'lucide-react'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                SGP
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/processos" 
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              Processos
            </Link>
            <Link 
              href="/relatorios" 
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              Relatórios
            </Link>
            <Link 
              href="/configuracoes" 
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              Configurações
            </Link>
          </nav>

          {/* Search and User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                className="pl-10 pr-4 py-2 rounded-full bg-gray-100 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all w-64"
              />
            </div>
            
            <button className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            
            <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-primary-600 transition-colors">
              <User className="h-5 w-5" />
              <span className="font-medium">Perfil</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/processos" 
                className="text-gray-600 hover:text-primary-600 transition-colors px-4 py-2 hover:bg-gray-50 rounded-lg"
              >
                Processos
              </Link>
              <Link 
                href="/relatorios" 
                className="text-gray-600 hover:text-primary-600 transition-colors px-4 py-2 hover:bg-gray-50 rounded-lg"
              >
                Relatórios
              </Link>
              <Link 
                href="/configuracoes" 
                className="text-gray-600 hover:text-primary-600 transition-colors px-4 py-2 hover:bg-gray-50 rounded-lg"
              >
                Configurações
              </Link>
              
              <div className="relative px-4">
                <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all"
                />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
} 