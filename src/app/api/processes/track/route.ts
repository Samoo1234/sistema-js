import { NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import { query } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, password } = body

    console.log('[PROCESS_TRACK] Iniciando busca de processo')
    console.log('[PROCESS_TRACK] Token recebido:', token)
    console.log('[PROCESS_TRACK] Senha recebida:', password)

    if (!token || !password) {
      console.log('[PROCESS_TRACK] Token ou senha faltando')
      return NextResponse.json({ 
        error: 'Token e senha são obrigatórios'
      }, { 
        status: 400 
      })
    }

    // Testar conexão com o banco
    try {
      await query('SELECT 1')
      console.log('[PROCESS_TRACK] Conexão com o banco OK')
    } catch (dbError) {
      console.error('[PROCESS_TRACK] Erro na conexão com o banco:', dbError)
      throw new Error('Erro na conexão com o banco de dados')
    }

    // Buscar processo pelo token com todos os detalhes necessários
    console.log('[PROCESS_TRACK] Buscando processo com token:', token)
    const result = await query(
      `SELECT 
        p.id,
        p.title,
        p.description,
        p.status,
        p.priority,
        p.login_token,
        p.password,
        p.created_at,
        p.updated_at,
        c.id as "clientId",
        c.name as "clientName",
        c.email as "clientEmail"
       FROM app.processes p
       LEFT JOIN app.clients c ON c.id = p.client_id
       WHERE UPPER(p.login_token) = UPPER($1)
       LIMIT 1`,
      [token]
    )

    const process = result.rows[0]

    if (!process) {
      console.log('[PROCESS_TRACK] Processo não encontrado para o token:', token)
      return NextResponse.json({ 
        error: 'Processo não encontrado'
      }, { 
        status: 404 
      })
    }

    console.log('[PROCESS_TRACK] Processo encontrado:', {
      id: process.id,
      title: process.title,
      clientName: process.clientName
    })

    // Verificar senha
    console.log('[PROCESS_TRACK] Verificando senha...')
    console.log('[PROCESS_TRACK] Senha fornecida:', password)
    console.log('[PROCESS_TRACK] Hash armazenado:', process.password)

    const isValidPassword = await compare(password, process.password)

    if (!isValidPassword) {
      console.log('[PROCESS_TRACK] Senha incorreta')
      return NextResponse.json({ 
        error: 'Senha incorreta'
      }, { 
        status: 401 
      })
    }

    console.log('[PROCESS_TRACK] Senha validada com sucesso')

    // Buscar histórico do processo
    const historyResult = await query(
      `SELECT 
        id,
        status,
        observation,
        created_by as "createdBy",
        created_at as "createdAt",
        attachments
       FROM app.process_history
       WHERE process_id = $1
       ORDER BY created_at DESC`,
      [process.id]
    )

    // Buscar documentos do cliente
    const documentsResult = await query(
      `SELECT 
        id,
        filename as name,
        type,
        created_at as "createdAt"
       FROM app.client_documents
       WHERE client_id = $1
       ORDER BY created_at DESC`,
      [process.clientId]
    )

    const response = {
      id: process.id,
      title: process.title,
      description: process.description,
      status: process.status,
      priority: process.priority,
      clientName: process.clientName,
      clientEmail: process.clientEmail,
      createdAt: process.created_at,
      updatedAt: process.updated_at,
      history: historyResult.rows,
      documents: documentsResult.rows
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[PROCESS_TRACK] Erro detalhado:', error)
    if (error instanceof Error) {
      console.error('[PROCESS_TRACK] Nome do erro:', error.name)
      console.error('[PROCESS_TRACK] Mensagem do erro:', error.message)
      console.error('[PROCESS_TRACK] Stack do erro:', error.stack)
    }
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { 
      status: 500 
    })
  }
} 