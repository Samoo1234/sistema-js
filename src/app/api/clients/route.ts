import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { query } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import crypto from 'crypto'
import { join } from 'path'
import { mkdir, writeFile } from 'fs/promises'

interface SessionUser {
  id: string
  email?: string | null
  name?: string | null
  image?: string | null
}

// Configuração para permitir uploads maiores
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb'
    }
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const user = session.user as SessionUser
    const formData = await request.formData()
    
    // Extrair dados do cliente
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const document = formData.get('document') as string
    const type = formData.get('type') as string
    const address = formData.get('address') as string
    const city = formData.get('city') as string
    const state = formData.get('state') as string
    const postalCode = formData.get('postalCode') as string
    const notes = formData.get('notes') as string
    const personalDocs = formData.getAll('personalDocs') as File[]
    const additionalDocs = formData.getAll('additionalDocs') as File[]

    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    if (!document) {
      return NextResponse.json({ error: 'Documento é obrigatório' }, { status: 400 })
    }

    // Criar cliente
    const clientResult = await query(
      `INSERT INTO app.clients (
        name,
        email,
        phone,
        document,
        type,
        address,
        city,
        state,
        postal_code,
        notes,
        user_id,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id`,
      [
        name,
        email,
        phone,
        document,
        type,
        address,
        city,
        state,
        postalCode,
        notes,
        user.id
      ]
    )

    const clientId = clientResult.rows[0].id

    // Processar documentos pessoais
    if (personalDocs.length > 0) {
      const uploadDir = join(process.cwd(), 'uploads', 'clients', clientId.toString())
      await mkdir(uploadDir, { recursive: true })

      // Salvar cada documento pessoal
      for (const file of personalDocs) {
        // Salvar arquivo
        await writeFile(
          join(uploadDir, file.name),
          Buffer.from(await file.arrayBuffer())
        )

        // Registrar no banco
        await query(
          `INSERT INTO app.client_documents (
            id,
            client_id,
            filename,
            type,
            created_at,
            updated_at
          ) VALUES (gen_random_uuid(), $1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [clientId, file.name, 'personal']
        )
      }
    }

    // Processar documentos complementares
    if (additionalDocs.length > 0) {
      const uploadDir = join(process.cwd(), 'uploads', 'clients', clientId.toString())
      await mkdir(uploadDir, { recursive: true })

      // Salvar cada documento complementar
      for (const file of additionalDocs) {
        // Salvar arquivo
        await writeFile(
          join(uploadDir, file.name),
          Buffer.from(await file.arrayBuffer())
        )

        // Registrar no banco
        await query(
          `INSERT INTO app.client_documents (
            id,
            client_id,
            filename,
            type,
            created_at,
            updated_at
          ) VALUES (gen_random_uuid(), $1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [clientId, file.name, 'additional']
        )
      }
    }

    return NextResponse.json({ id: clientId })
  } catch (error) {
    console.error('[CLIENT_CREATE]', error)
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
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    let sqlQuery = 'SELECT * FROM app.clients WHERE user_id = $1'
    const params = [user.id]
    let paramCount = 2

    if (searchQuery) {
      sqlQuery += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR document ILIKE $${paramCount})`
      params.push(`%${searchQuery}%`)
      paramCount++
    }

    if (type) {
      sqlQuery += ` AND type = $${paramCount}`
      params.push(type)
      paramCount++
    }

    if (status) {
      sqlQuery += ` AND status = $${paramCount}`
      params.push(status)
    }

    sqlQuery += ' ORDER BY created_at DESC'

    const result = await query(sqlQuery, params)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.log('[CLIENTS_GET]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}