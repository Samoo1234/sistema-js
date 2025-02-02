import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'
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
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = session.user as SessionUser
    const formData = await request.formData()
    const file = formData.get('file') as File
    const processId = formData.get('processId') as string

    if (!file) {
      return new NextResponse('Arquivo não encontrado', { status: 400 })
    }

    if (!processId) {
      return new NextResponse('ID do processo não encontrado', { status: 400 })
    }

    // Verifica se o processo existe e pertence ao usuário
    const processResult = await query(
      'SELECT * FROM app.processes WHERE id = $1 AND user_id = $2',
      [processId, user.id]
    )

    if (processResult.rows.length === 0) {
      return new NextResponse('Processo não encontrado', { status: 404 })
    }

    // Cria o diretório de uploads se não existir
    const uploadDir = join(process.cwd(), 'uploads', processId)
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error
      }
    }
    await writeFile(join(uploadDir, file.name), Buffer.from(await file.arrayBuffer()))

    // Registra o upload no histórico
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
        processId,
        'DOCUMENTO_ANEXADO',
        `Documento anexado: ${file.name}`,
        [file.name],
        user.email || 'sistema'
      ]
    )

    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error('[PROCESS_UPLOAD]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
} 