import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { query } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import crypto from 'crypto'
import { hash } from 'bcryptjs'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

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
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const user = session.user as SessionUser
    const formData = await request.formData()
    
    // Extrair dados do processo
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const clientId = formData.get('clientId') as string
    const priority = formData.get('priority') as string
    const documents = formData.getAll('documents') as File[]

    if (!title) {
      return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 })
    }

    if (!clientId) {
      return NextResponse.json({ error: 'Cliente é obrigatório' }, { status: 400 })
    }

    // Gerar credenciais
    const loginToken = crypto.randomBytes(4).toString('hex')
    const password = crypto.randomBytes(4).toString('hex')
    const hashedPassword = await hash(password, 12)

    // Criar processo
    const processResult = await query(
      `INSERT INTO app.processes (
        id,
        title,
        description,
        client_id,
        priority,
        login_token,
        password,
        user_id,
        created_at,
        updated_at
      ) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id`,
      [
        title,
        description,
        clientId,
        priority || 'MEDIUM',
        loginToken,
        hashedPassword,
        user.id
      ]
    )

    const processId = processResult.rows[0].id

    // Criar diretório para documentos
    if (documents.length > 0) {
      const uploadDir = join(process.cwd(), 'uploads', processId)
      await mkdir(uploadDir, { recursive: true })

      // Salvar cada documento
      for (const file of documents) {
        // Salvar arquivo
        await writeFile(
          join(uploadDir, file.name),
          Buffer.from(await file.arrayBuffer())
        )

        // Registrar no banco
        await query(
          `INSERT INTO app.process_documents (
            id,
            process_id,
            filename,
            type,
            created_at,
            updated_at
          ) VALUES (gen_random_uuid(), $1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [processId, file.name, 'personal']
        )
      }

      // Registrar no histórico
      await query(
        `INSERT INTO app.process_history (
          id,
          process_id,
          status,
          observation,
          attachments,
          created_by,
          created_at
        ) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
        [
          processId,
          'CADASTRO_REALIZADO',
          `Processo cadastrado com ${documents.length} documento(s)`,
          documents.map(doc => doc.name),
          user.email || 'sistema'
        ]
      )
    } else {
      // Registrar histórico sem documentos
      await query(
        `INSERT INTO app.process_history (
          id,
          process_id,
          status,
          observation,
          created_by,
          created_at
        ) VALUES (gen_random_uuid(), $1, $2, $3, $4, CURRENT_TIMESTAMP)`,
        [
          processId,
          'CADASTRO_REALIZADO',
          'Processo cadastrado com sucesso',
          user.email || 'sistema'
        ]
      )
    }

    return NextResponse.json({
      id: processId,
      credentials: {
        loginToken,
        password
      }
    })
  } catch (error) {
    console.error('[PROCESS_CREATE]', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { 
      status: 500 
    })
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