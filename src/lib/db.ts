import { Pool } from 'pg'

const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '123456',
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432'),
  database: process.env.PGDATABASE || 'sgp_db'
})

export async function query(text: string, params?: any[]) {
  return pool.query(text, params)
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
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'user',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `

  const createClientsTable = `
    CREATE TABLE IF NOT EXISTS clients (
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
      user_id INTEGER NOT NULL REFERENCES users(id)
    );
  `

  const createProcessesTable = `
    CREATE TABLE IF NOT EXISTS processes (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(50) DEFAULT 'cadastro_realizado',
      priority VARCHAR(50) DEFAULT 'medium',
      login_token VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      user_id INTEGER NOT NULL REFERENCES users(id),
      client_id INTEGER REFERENCES clients(id)
    );
  `

  const createProcessHistoryTable = `
    CREATE TABLE IF NOT EXISTS process_history (
      id SERIAL PRIMARY KEY,
      process_id INTEGER NOT NULL REFERENCES processes(id),
      status VARCHAR(50) NOT NULL,
      observation TEXT,
      attachments TEXT[],
      created_by VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `

  try {
    await query(createUsersTable)
    await query(createClientsTable)
    await query(createProcessesTable)
    await query(createProcessHistoryTable)
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