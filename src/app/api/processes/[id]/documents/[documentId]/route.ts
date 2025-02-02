import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'
import { readFile } from 'fs/promises'
import { join } from 'path'

interface SessionUser {
  id: string
  email?: string | null
  name?: string | null
  image?: string | null
}

export async function GET(
  request: Request,
  { params }: { params: { id: string; documentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = session.user as SessionUser

    // Verificar se o processo existe e pertence ao usuário
    const processResult = await query(
      'SELECT * FROM app.processes WHERE id = $1 AND user_id = $2',
      [params.id, user.id]
    )

    if (processResult.rows.length === 0) {
      return new NextResponse('Processo não encontrado', { status: 404 })
    }

    // Buscar informações do documento
    const documentResult = await query(
      `SELECT cd.* 
       FROM app.client_documents cd
       INNER JOIN app.processes p ON p.client_id = cd.client_id
       WHERE cd.id = $1 AND p.id = $2`,
      [params.documentId, params.id]
    )

    if (documentResult.rows.length === 0) {
      return new NextResponse('Documento não encontrado', { status: 404 })
    }

    const document = documentResult.rows[0]

    // Ler o arquivo do disco
    const filePath = join(process.cwd(), 'uploads', 'clients', document.client_id.toString(), document.filename)
    const fileBuffer = await readFile(filePath)

    // Retornar o arquivo como download
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${document.filename}"`,
      },
    })
  } catch (error) {
    console.error('[PROCESS_DOCUMENT_GET]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
} 