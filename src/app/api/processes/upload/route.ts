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
    console.log('[PROCESS_UPLOAD] Iniciando upload...')
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = session.user as SessionUser
    const formData = await request.formData()
    const file = formData.get('file') as File
    const processId = formData.get('processId') as string

    console.log('[PROCESS_UPLOAD] Arquivo:', file.name)
    console.log('[PROCESS_UPLOAD] Processo ID:', processId)

    if (!file) {
      return new NextResponse('Arquivo não encontrado', { status: 400 })
    }

    if (!processId) {
      return new NextResponse('ID do processo não encontrado', { status: 400 })
    }

    // Verifica se o processo existe e pertence ao usuário
    console.log('[PROCESS_UPLOAD] Verificando processo...')
    const processResult = await query(
      'SELECT * FROM app.processes WHERE id = $1 AND user_id = $2',
      [processId, user.id]
    )

    if (processResult.rows.length === 0) {
      return new NextResponse('Processo não encontrado', { status: 404 })
    }

    // Cria o diretório de uploads se não existir
    console.log('[PROCESS_UPLOAD] Salvando arquivo...')
    const uploadDir = join(process.cwd(), 'uploads', processId)
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error
      }
    }
    await writeFile(join(uploadDir, file.name), Buffer.from(await file.arrayBuffer()))
    console.log('[PROCESS_UPLOAD] Arquivo salvo com sucesso')

    // Registra o documento no banco de dados
    console.log('[PROCESS_UPLOAD] Registrando documento no banco...')
    const documentResult = await query(
      `INSERT INTO app.process_documents (
        id,
        process_id,
        filename,
        type,
        created_at,
        updated_at
      ) VALUES (gen_random_uuid(), $1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        processId,
        file.name,
        'personal' // ou 'additional' dependendo do tipo
      ]
    )
    console.log('[PROCESS_UPLOAD] Documento registrado:', documentResult.rows[0])

    // Registra o upload no histórico
    console.log('[PROCESS_UPLOAD] Registrando no histórico...')
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
        'DOCUMENTO_ANEXADO',
        `Documento anexado: ${file.name}`,
        [file.name],
        user.email || 'sistema'
      ]
    )
    console.log('[PROCESS_UPLOAD] Histórico registrado')

    return NextResponse.json({ success: true, document: documentResult.rows[0] })
  } catch (error) {
    console.error('[PROCESS_UPLOAD] Erro:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { 
      status: 500 
    })
  }
} 