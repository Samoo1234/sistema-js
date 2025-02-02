import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Buscar processo e cliente
    const result = await query(
      `SELECT p.*, c.name as "clientName", c.email as "clientEmail"
       FROM "Process" p
       LEFT JOIN "Client" c ON c.id = p."clientId"
       WHERE p.id = $1
       LIMIT 1`,
      [params.id]
    )

    const process = result.rows[0]

    if (!process) {
      return new NextResponse('Processo não encontrado', { status: 404 })
    }

    // Buscar histórico do processo
    const historyResult = await query(
      `SELECT * FROM "ProcessHistory"
       WHERE "processId" = $1
       ORDER BY "createdAt" DESC`,
      [params.id]
    )

    return NextResponse.json({
      ...process,
      history: historyResult.rows
    })
  } catch (error) {
    console.log('[PROCESS_PUBLIC_GET]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
} 