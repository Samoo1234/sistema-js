import { Pool } from 'pg'

const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT || '5432'),
  database: process.env.PGDATABASE,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

// Teste de conexão
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

export async function query(text: string, params?: any[]) {
  try {
    const start = Date.now()
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('Executed query', { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error('Error executing query', { text, error })
    throw error
  }
}

export async function transaction<T>(callback: (client: any) => Promise<T>) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}

// Função para criar as tabelas necessárias
export async function setupDatabase() {
  try {
    // Criar schema
    await query('CREATE SCHEMA IF NOT EXISTS app')
    
    // Criar tabelas
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS app.users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    const createClientsTable = `
      CREATE TABLE IF NOT EXISTS app.clients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(50),
        document VARCHAR(50) UNIQUE,
        rg VARCHAR(50),
        document_type VARCHAR(50) DEFAULT 'RG',
        type VARCHAR(50) DEFAULT 'PF',
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(50),
        postal_code VARCHAR(20),
        status VARCHAR(50) DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER NOT NULL REFERENCES app.users(id)
      )
    `

    const createProcessesTable = `
      CREATE TABLE IF NOT EXISTS app.processes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'cadastro_realizado',
        priority VARCHAR(50) DEFAULT 'medium',
        login_token VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER NOT NULL REFERENCES app.users(id),
        client_id INTEGER REFERENCES app.clients(id)
      )
    `

    const createProcessHistoryTable = `
      CREATE TABLE IF NOT EXISTS app.process_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        process_id UUID NOT NULL REFERENCES app.processes(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL,
        observation TEXT,
        attachments TEXT[],
        created_by VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    const createClientDocumentsTable = `
      CREATE TABLE IF NOT EXISTS app.client_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        client_id INTEGER NOT NULL REFERENCES app.clients(id) ON DELETE CASCADE,
        filename VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    await query(createUsersTable)
    await query(createClientsTable)
    await query(createProcessesTable)
    await query(createProcessHistoryTable)
    await query(createClientDocumentsTable)
    
    console.log('✅ Banco de dados inicializado com sucesso!')
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error)
    throw error
  }
}

// Função para atualizar a estrutura das tabelas
export async function updateDatabaseSchema() {
  const addClientTokenColumns = `
    DO $$ 
    BEGIN 
      BEGIN
        ALTER TABLE "Client" ADD COLUMN token TEXT UNIQUE;
      EXCEPTION
        WHEN duplicate_column THEN 
          NULL;
      END;
      
      BEGIN
        ALTER TABLE "Client" ADD COLUMN password TEXT;
      EXCEPTION
        WHEN duplicate_column THEN 
          NULL;
      END;
    END $$;
  `

  try {
    await query(addClientTokenColumns)
    console.log('Esquema do banco atualizado com sucesso!')
  } catch (error) {
    console.error('Erro ao atualizar esquema do banco:', error)
    throw error
  }
}

// Função para executar migrações
export async function runMigrations() {
  try {
    // Remover colunas token e password da tabela Client
    await query(`
      ALTER TABLE "Client" 
      DROP COLUMN IF EXISTS token,
      DROP COLUMN IF EXISTS password;
    `)

    console.log('Migrações executadas com sucesso!')
  } catch (error) {
    console.error('Erro ao executar migrações:', error)
    throw error
  }
}

// Executar setup ao inicializar
setupDatabase() 