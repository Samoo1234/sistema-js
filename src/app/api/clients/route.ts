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
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = session.user as SessionUser

    const formData = await request.formData()

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const document = formData.get('document') as string
    const rg = formData.get('rg') as string
    const documentType = formData.get('documentType') as string
    const type = formData.get('type') as string
    const address = formData.get('address') as string
    const city = formData.get('city') as string
    const state = formData.get('state') as string
    const postalCode = formData.get('postalCode') as string
    const notes = formData.get('notes') as string

    if (!name) {
      return new NextResponse('Nome é obrigatório', { status: 400 })
    }

    const result = await query(
      `INSERT INTO app.clients (
        name, 
        email, 
        phone, 
        document, 
        rg, 
        document_type, 
        type, 
        address, 
        city, 
        state, 
        postal_code, 
        status, 
        notes,
        created_at, 
        updated_at, 
        user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $14)
      RETURNING *`,
      [
        name,
        email,
        phone,
        document,
        rg,
        documentType,
        type,
        address,
        city,
        state,
        postalCode,
        'active',
        notes,
        user.id
      ]
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.log('[CLIENTS_POST]', error)
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