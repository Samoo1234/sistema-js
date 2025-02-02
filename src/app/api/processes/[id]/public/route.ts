import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[PROCESS_PUBLIC_GET] Buscando processo:', params.id)
    
    // Buscar processo e cliente
    const result = await query(
      `SELECT p.*, c.name as "clientName", c.email as "clientEmail"
       FROM app.processes p
       LEFT JOIN app.clients c ON c.id = p.client_id
       WHERE p.id = $1
       LIMIT 1`,
      [params.id]
    )

    const process = result.rows[0]
    console.log('[PROCESS_PUBLIC_GET] Processo encontrado:', {
      id: process?.id,
      title: process?.title,
      status: process?.status,
      clientName: process?.clientName
    })

    if (!process) {
      return new NextResponse('Processo não encontrado', { status: 404 })
    }

    // Buscar histórico do processo
    const historyResult = await query(
      `SELECT 
        id,
        status,
        observation,
        attachments,
        created_by as "createdBy",
        created_at as "createdAt"
       FROM app.process_history
       WHERE process_id = $1
       ORDER BY created_at DESC`,
      [params.id]
    )

    console.log('[PROCESS_PUBLIC_GET] Histórico encontrado:', historyResult.rows)

    return NextResponse.json({
      ...process,
      history: historyResult.rows
    })
  } catch (error) {
    console.log('[PROCESS_PUBLIC_GET]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
} 