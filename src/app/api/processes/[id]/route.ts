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
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = session.user as SessionUser

    // Buscar processo e cliente
    const result = await query(
      `SELECT p.*, c.name as client_name, c.email as client_email
       FROM app.processes p
       LEFT JOIN app.clients c ON c.id = p.client_id
       WHERE p.id = $1 AND p.user_id = $2
       LIMIT 1`,
      [params.id, user.id]
    )

    const process = result.rows[0]

    if (!process) {
      return new NextResponse('Processo não encontrado', { status: 404 })
    }

    // Buscar histórico do processo
    const historyResult = await query(
      `SELECT * FROM app.process_history
       WHERE process_id = $1
       ORDER BY created_at DESC`,
      [params.id]
    )

    return NextResponse.json({
      ...process,
      history: historyResult.rows
    })
  } catch (error) {
    console.log('[PROCESS_GET]', error)
    return new NextResponse('Internal error', { status: 500 })
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