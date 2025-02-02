import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Não autorizado', { status: 401 })
    }

    const body = await request.json()
    const { status, observation } = body

    // Validar status permitidos
    const allowedStatus = [
      'CADASTRO_REALIZADO',
      'EM_ANALISE_DOCUMENTOS',
      'DOCUMENTOS_APROVADOS',
      'DOCUMENTOS_REPROVADOS'
    ]

    if (!allowedStatus.includes(status)) {
      return new NextResponse('Status inválido', { status: 400 })
    }

    // Atualizar status do processo
    await query(
      `UPDATE app.processes 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [status, params.id]
    )

    // Registrar no histórico
    await query(
      `INSERT INTO app.process_history 
       (process_id, status, observation, created_by)
       VALUES ($1, $2, $3, $4)`,
      [params.id, status, observation, session.user.name]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.log('[PROCESS_STATUS_UPDATE]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
} 