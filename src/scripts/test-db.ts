import { Pool } from 'pg'

async function testConnection() {
  const pool = new Pool({
    user: 'postgres',
    password: '123456',
    host: 'localhost',
    port: 5432,
    database: 'sgp_db'
  })

  try {
    const client = await pool.connect()
    console.log('✅ Conexão bem sucedida!')
    
    const result = await client.query('SELECT version()')
    console.log('Versão do PostgreSQL:', result.rows[0].version)
    
    client.release()
    process.exit(0)
  } catch (error) {
    console.error('❌ Erro ao conectar:', error)
    process.exit(1)
  }
}

testConnection() 