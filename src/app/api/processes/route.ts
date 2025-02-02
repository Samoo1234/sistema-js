import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { query } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import crypto from 'crypto'
import { hash } from 'bcryptjs'

interface SessionUser {
  id: string
  email?: string | null
  name?: string | null
  image?: string | null
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = session.user as SessionUser
    let body;
    
    try {
      body = await request.json()
    } catch (parseError) {
      console.log('[PROCESSES_POST] Erro ao fazer parse do body:', parseError)
      return new NextResponse('Erro ao processar dados', { status: 400 })
    }

    const {
      title,
      description,
      clientId,
      priority = 'MEDIUM'
    } = body

    if (!title) {
      return new NextResponse('Título é obrigatório', { status: 400 })
    }

    if (!clientId) {
      return new NextResponse('Cliente é obrigatório', { status: 400 })
    }

    // Gerar token e senha de acesso
    const loginToken = crypto.randomBytes(6).toString('hex').toUpperCase()
    const password = crypto.randomBytes(4).toString('hex').toUpperCase()
    const hashedPassword = await hash(password, 10)

    console.log('[PROCESSES_POST] Dados do processo:', {
      title,
      description,
      clientId,
      priority,
      userId: user.id
    })

    // Criar o processo
    const result = await query(
      `WITH inserted_process AS (
        INSERT INTO app.processes (
          title,
          description,
          status,
          priority,
          login_token,
          password,
          created_at,
          updated_at,
          user_id,
          client_id
        ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $7, $8)
        RETURNING *
      )
      SELECT 
        p.*,
        c.name as "clientName",
        p.created_at as "createdAt"
      FROM inserted_process p
      LEFT JOIN app.clients c ON c.id = p.client_id`,
      [
        title,
        description,
        'CADASTRO_REALIZADO',
        priority,
        loginToken,
        hashedPassword,
        user.id,
        clientId
      ]
    )

    const process = result.rows[0]

    // Criar histórico inicial
    await query(
      `INSERT INTO app.process_history (
        process_id,
        status,
        observation,
        attachments,
        created_by,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
      [
        process.id,
        'CADASTRO_REALIZADO',
        'Processo cadastrado com sucesso',
        [],
        user.email || 'sistema'
      ]
    )

    return NextResponse.json({
      ...process,
      credentials: {
        loginToken,
        password
      }
    })
  } catch (error) {
    console.log('[PROCESSES_POST] Erro detalhado:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = session.user as SessionUser

    const { searchParams } = new URL(request.url)
    const searchQuery = searchParams.get('query')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    let sqlQuery = `
      SELECT 
        p.*,
        c.name as "clientName",
        p.created_at as "createdAt"
      FROM app.processes p
      LEFT JOIN app.clients c ON c.id = p.client_id
      WHERE p.user_id = $1
    `
    const params = [user.id]
    let paramCount = 2

    if (searchQuery) {
      sqlQuery += ` AND (p.title ILIKE $${paramCount} OR c.name ILIKE $${paramCount})`
      params.push(`%${searchQuery}%`)
      paramCount++
    }

    if (status) {
      sqlQuery += ` AND p.status = $${paramCount}`
      params.push(status)
      paramCount++
    }

    if (priority) {
      sqlQuery += ` AND p.priority = $${paramCount}`
      params.push(priority)
    }

    sqlQuery += ' ORDER BY p.created_at DESC'

    const result = await query(sqlQuery, params)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.log('[PROCESSES_GET]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
} 