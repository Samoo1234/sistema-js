import { hash } from 'bcryptjs'
import { query } from '../lib/db'

async function setupDatabase() {
  try {
    // Criar schema
    await query('CREATE SCHEMA IF NOT EXISTS app')
    
    // Criar tabelas
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS app.users (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `

    const createClientsTable = `
      CREATE TABLE IF NOT EXISTS app.clients (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
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
      );
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
      );
    `

    const createProcessHistoryTable = `
      CREATE TABLE IF NOT EXISTS app.process_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        process_id UUID NOT NULL REFERENCES app.processes(id),
        status VARCHAR(50) NOT NULL,
        observation TEXT,
        attachments TEXT[],
        created_by VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `

    // Criar tabela de documentos do processo
    await query(`
      CREATE TABLE IF NOT EXISTS app.process_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        process_id UUID NOT NULL REFERENCES app.processes(id) ON DELETE CASCADE,
        filename VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Criar tabelas
    await query(createUsersTable)
    await query(createClientsTable)
    await query(createProcessesTable)
    await query(createProcessHistoryTable)
    console.log('✅ Tabelas criadas com sucesso!')

    // Verificar se já existe um usuário admin
    const adminResult = await query('SELECT * FROM app.users WHERE email = $1', ['admin@sgp.com'])
    
    if (adminResult.rows.length === 0) {
      // Criar usuário admin padrão
      const hashedPassword = await hash('123456', 12)
      await query(
        'INSERT INTO app.users (name, email, password, role) VALUES ($1, $2, $3, $4)',
        ['Administrador', 'admin@sgp.com', hashedPassword, 'admin']
      )
      console.log('✅ Usuário admin criado com sucesso!')
    } else {
      console.log('ℹ️ Usuário admin já existe')
    }

    console.log('✅ Setup concluído com sucesso!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Erro durante o setup:', error)
    process.exit(1)
  }
}

setupDatabase() 