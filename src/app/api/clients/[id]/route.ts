import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { query } from '@/lib/db'
import { authOptions } from '@/lib/auth'

interface SessionUser {
  id: string
  email?: string | null
  name?: string | null
  image?: string | null
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = session.user as SessionUser

    console.log('[CLIENT_DELETE] Tentando deletar cliente:', params.id)

    // Verificar se o cliente existe e pertence ao usuário
    const result = await query(
      'SELECT * FROM app.clients WHERE id = $1 AND user_id = $2',
      [params.id, user.id]
    )

    const client = result.rows[0]

    if (!client) {
      console.log('[CLIENT_DELETE] Cliente não encontrado:', params.id)
      return new NextResponse('Cliente não encontrado', { status: 404 })
    }

    // Primeiro deletar o histórico dos processos
    await query(
      `DELETE FROM app.process_history 
       WHERE process_id IN (
         SELECT id FROM app.processes WHERE client_id = $1
       )`,
      [params.id]
    )

    // Depois deletar os processos
    await query(
      'DELETE FROM app.processes WHERE client_id = $1',
      [params.id]
    )

    // Por fim, deletar o cliente
    await query('DELETE FROM app.clients WHERE id = $1', [params.id])
    console.log('[CLIENT_DELETE] Cliente e processos relacionados deletados com sucesso:', params.id)

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.log('[CLIENT_DELETE] Erro detalhado:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ message: 'Não autorizado' }),
        { status: 401 }
      )
    }

    const user = session.user as SessionUser

    const client = await query(
      'SELECT * FROM app.clients WHERE id = $1 AND user_id = $2',
      [params.id, user.id]
    )

    if (client.rows.length === 0) {
      return new NextResponse(
        JSON.stringify({ message: 'Cliente não encontrado' }),
        { status: 404 }
      )
    }

    return NextResponse.json(client.rows[0])
  } catch (error) {
    console.error('[CLIENT_GET]', error)
    return new NextResponse(
      JSON.stringify({ message: 'Erro interno do servidor' }),
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ message: 'Não autorizado' }),
        { status: 401 }
      )
    }

    const user = session.user as SessionUser

    const client = await query(
      'SELECT * FROM app.clients WHERE id = $1 AND user_id = $2',
      [params.id, user.id]
    )

    if (client.rows.length === 0) {
      return new NextResponse(
        JSON.stringify({ message: 'Cliente não encontrado' }),
        { status: 404 }
      )
    }

    const data = await request.json()

    const updateResult = await query(
      `UPDATE app.clients
       SET name = $1,
           email = $2,
           phone = $3,
           document = $4,
           rg = $5,
           document_type = $6,
           type = $7,
           address = $8,
           city = $9,
           state = $10,
           postal_code = $11,
           status = $12,
           notes = $13,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $14
       RETURNING *`,
      [
        data.name,
        data.email,
        data.phone,
        data.document,
        data.rg,
        data.documentType,
        data.type,
        data.address,
        data.city,
        data.state,
        data.postalCode,
        data.status,
        data.notes,
        params.id
      ]
    )

    return NextResponse.json(updateResult.rows[0])
  } catch (error) {
    console.error('[CLIENT_UPDATE]', error)
    return new NextResponse(
      JSON.stringify({ message: 'Erro interno do servidor' }),
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    const {
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
      status,
      notes
    } = body

    // Verificar se o cliente existe e pertence ao usuário
    const result = await query(
      'SELECT * FROM app.clients WHERE id = $1 AND user_id = $2',
      [params.id, user.id]
    )

    const client = result.rows[0]

    if (!client) {
      return new NextResponse('Cliente não encontrado', { status: 404 })
    }

    // Atualizar cliente
    const updateResult = await query(
      `UPDATE app.clients
       SET name = $1,
           email = $2,
           phone = $3,
           document = $4,
           rg = $5,
           document_type = $6,
           type = $7,
           address = $8,
           city = $9,
           state = $10,
           postal_code = $11,
           status = $12,
           notes = $13,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $14
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
        status,
        notes,
        params.id
      ]
    )

    return NextResponse.json(updateResult.rows[0])
  } catch (error) {
    console.log('[CLIENT_PATCH]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
} 