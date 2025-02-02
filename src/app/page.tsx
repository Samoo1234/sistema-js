'use client'

import { useRouter } from 'next/navigation'
import { BarChart2, FileText, Settings, Search, ClipboardList } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[600px]">
        <Image
          src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070"
          alt="Profissional analisando processos"
          fill
          className="object-cover brightness-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              SGP - Sistema de Gerenciamento de Processos
            </h1>
            <p className="mt-6 text-xl text-gray-300">
              Transforme a gestão dos seus processos com eficiência e organização. Nossa solução foi desenvolvida para otimizar o fluxo de trabalho em escritórios e departamentos jurídicos.
            </p>
            <div className="mt-10 flex gap-4">
              <Link
                href="/login"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
              >
                Acessar Sistema
              </Link>
              <Link
                href="/acompanhamento"
                className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white/10 transition-colors"
              >
                <ClipboardList className="w-5 h-5 mr-2" />
                Acompanhar Processo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Sobre Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Excelência em Gestão de Processos
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                O SGP foi desenvolvido para atender às necessidades específicas de escritórios e departamentos que lidam com grande volume de processos e documentos.
              </p>
              <div className="mt-8">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-600 text-white">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Organização Eficiente</h3>
                    <p className="mt-2 text-base text-gray-600">
                      Mantenha seus processos organizados e facilmente acessíveis
                    </p>
                  </div>
                </div>
                <div className="mt-8 flex items-center">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-600 text-white">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Agilidade nas Decisões</h3>
                    <p className="mt-2 text-base text-gray-600">
                      Tome decisões rápidas com base em informações centralizadas
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-10 lg:mt-0">
              <div className="relative h-96 rounded-lg overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1635859890085-ec8cb5466002?q=80&w=2070"
                  alt="Documentos e processos organizados"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="recursos" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Recursos Especializados
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Ferramentas desenvolvidas para otimizar seu fluxo de trabalho
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="relative">
                <div className="h-64 relative rounded-lg overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1568992687947-868a62a9f521?q=80&w=2072"
                    alt="Gestão de Processos"
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="mt-8 text-lg font-semibold text-gray-900">
                  Controle de Processos
                </h3>
                <p className="mt-2 text-base text-gray-600">
                  Acompanhamento detalhado de cada processo, com histórico completo e status em tempo real.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="relative">
                <div className="h-64 relative rounded-lg overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=2070"
                    alt="Organização e Produtividade"
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="mt-8 text-lg font-semibold text-gray-900">
                  Gestão Documental
                </h3>
                <p className="mt-2 text-base text-gray-600">
                  Organize e acesse facilmente todos os documentos relacionados aos seus processos.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="relative">
                <div className="h-64 relative rounded-lg overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1573497620053-ea5300f94f21?q=80&w=2070"
                    alt="Relatórios e Análises"
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="mt-8 text-lg font-semibold text-gray-900">
                  Relatórios e Análises
                </h3>
                <p className="mt-2 text-base text-gray-600">
                  Gere relatórios detalhados e análises estatísticas para melhor tomada de decisão.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-primary-700">
        <div className="relative h-96">
          <Image
            src="https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?q=80&w=2047"
            alt="Equipe de trabalho"
            fill
            className="object-cover mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-primary-700/90" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center">
            <div className="text-center max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Transforme sua gestão de processos
              </h2>
              <p className="mt-4 text-lg text-primary-100">
                Junte-se a diversos profissionais que já otimizaram sua gestão de processos com o SGP
              </p>
              <div className="mt-8">
                <Link
                  href="/login"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50 transition-colors"
                >
                  Começar Agora
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 