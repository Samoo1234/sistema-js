import { NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import { query } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return new NextResponse('Token e senha são obrigatórios', { status: 400 })
    }

    // Buscar processo pelo token
    const result = await query(
      `SELECT p.*, c.name as client_name, c.email as client_email
       FROM app.processes p
       LEFT JOIN app.clients c ON c.id = p.client_id
       WHERE p.login_token = $1
       LIMIT 1`,
      [token]
    )

    const process = result.rows[0]

    if (!process) {
      return new NextResponse('Processo não encontrado', { status: 404 })
    }

    // Verificar senha
    const isValidPassword = await compare(password, process.password)

    if (!isValidPassword) {
      return new NextResponse('Senha incorreta', { status: 401 })
    }

    // Buscar histórico do processo
    const historyResult = await query(
      `SELECT * FROM app.process_history
       WHERE process_id = $1
       ORDER BY created_at DESC`,
      [process.id]
    )

    return NextResponse.json({
      ...process,
      history: historyResult.rows
    })
  } catch (error) {
    console.log('[PROCESS_TRACK]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
} 