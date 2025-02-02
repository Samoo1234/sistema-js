import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { query } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import crypto from 'crypto'

interface SessionUser {
  id: string
  email?: string | null
  name?: string | null
  image?: string | null
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Testar conexão com o banco
    try {
      await query('SELECT 1')
      console.log('[PROCESS_GET] Conexão com o banco OK')
    } catch (dbError) {
      console.error('[PROCESS_GET] Erro na conexão com o banco:', dbError)
      throw new Error('Erro na conexão com o banco de dados')
    }

    console.log('[PROCESS_GET] Iniciando busca do processo:', params.id)
    
    const session = await getServerSession(authOptions)
    console.log('[PROCESS_GET] Sessão:', JSON.stringify(session))

    if (!session?.user) {
      console.log('[PROCESS_GET] Usuário não autenticado')
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const user = session.user as SessionUser
    console.log('[PROCESS_GET] Email do usuário:', user.email)

    if (!user.email) {
      console.log('[PROCESS_GET] Email do usuário não encontrado na sessão')
      return NextResponse.json({ error: 'Email do usuário não encontrado' }, { status: 400 })
    }

    // Primeiro buscar o ID numérico do usuário
    console.log('[PROCESS_GET] Buscando ID do usuário no banco...')
    const userResult = await query(
      'SELECT id FROM app.users WHERE email = $1',
      [user.email]
    )
    console.log('[PROCESS_GET] Resultado da busca do usuário:', userResult.rows)

    if (userResult.rows.length === 0) {
      console.log('[PROCESS_GET] Usuário não encontrado no banco:', user.email)
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const userId = userResult.rows[0].id
    console.log('[PROCESS_GET] ID do usuário encontrado:', userId)

    // Buscar processo e cliente
    console.log('[PROCESS_GET] Buscando processo...')
    const processResult = await query(
      `SELECT 
        p.*,
        c.name as "clientName",
        c.email as "clientEmail"
      FROM app.processes p
      LEFT JOIN app.clients c ON c.id = p.client_id
      WHERE p.id::text = $1 AND p.user_id = $2`,
      [params.id, userId]
    )
    console.log('[PROCESS_GET] SQL do processo executado com sucesso')
    console.log('[PROCESS_GET] Resultado da busca do processo:', processResult.rows)

    if (processResult.rows.length === 0) {
      console.log('[PROCESS_GET] Processo não encontrado:', params.id)
      return NextResponse.json({ error: 'Processo não encontrado ou sem permissão de acesso' }, { status: 404 })
    }

    const process = processResult.rows[0]
    console.log('[PROCESS_GET] Processo encontrado:', process.id)

    // Buscar histórico do processo
    console.log('[PROCESS_GET] Buscando histórico...')
    const historyResult = await query(
      `SELECT 
        id,
        status,
        observation,
        created_by as "createdBy",
        created_at as "createdAt"
      FROM app.process_history 
      WHERE process_id::text = $1 
      ORDER BY created_at DESC`,
      [params.id]
    )
    console.log('[PROCESS_GET] Histórico encontrado:', historyResult.rows.length, 'registros')

    // Buscar documentos do cliente vinculado ao processo
    console.log('[PROCESS_GET] Buscando documentos do cliente...')
    const documentsResult = await query(
      `SELECT 
        cd.id,
        cd.filename as name,
        cd.created_at as "createdAt",
        cd.type
      FROM app.client_documents cd
      INNER JOIN app.processes p ON p.client_id = cd.client_id
      WHERE p.id::text = $1 
      ORDER BY cd.created_at DESC`,
      [params.id]
    )
    console.log('[PROCESS_GET] Documentos encontrados:', documentsResult.rows.length, 'arquivos')

    const response = {
      ...process,
      history: historyResult.rows,
      documents: documentsResult.rows
    }

    console.log('[PROCESS_GET] Retornando resposta com sucesso')
    return NextResponse.json(response)
  } catch (error) {
    console.error('[PROCESS_GET] Erro detalhado:', error)
    if (error instanceof Error) {
      console.error('[PROCESS_GET] Nome do erro:', error.name)
      console.error('[PROCESS_GET] Mensagem do erro:', error.message)
      console.error('[PROCESS_GET] Stack do erro:', error.stack)
    }
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { 
      status: 500
    })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = session.user as SessionUser
    const body = await request.json()
    const { status, observation } = body

    if (!status) {
      return new NextResponse('Status é obrigatório', { status: 400 })
    }

    if (!observation) {
      return new NextResponse('Observação é obrigatória', { status: 400 })
    }

    // Verificar se o processo existe e pertence ao usuário
    const processResult = await query(
      `SELECT * FROM app.processes
       WHERE id = $1 AND user_id = $2
       LIMIT 1`,
      [params.id, user.id]
    )

    const process = processResult.rows[0]

    if (!process) {
      return new NextResponse('Processo não encontrado', { status: 404 })
    }

    // Atualizar status do processo
    await query(
      `UPDATE app.processes
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [status, params.id]
    )

    // Criar histórico
    await query(
      `INSERT INTO app.process_history (
        id,
        process_id,
        status,
        observation,
        created_by,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
      [
        crypto.randomUUID(),
        params.id,
        status,
        observation,
        user.email || 'sistema'
      ]
    )

    return new NextResponse('OK')
  } catch (error) {
    console.log('[PROCESS_UPDATE]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
} 