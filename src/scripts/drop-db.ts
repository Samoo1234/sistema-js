import { Pool } from 'pg'

async function dropDatabase() {
  // Conectar ao banco postgres para poder dropar o banco sgp_db
  const pool = new Pool({
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '123456',
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432'),
    database: 'postgres' // Conectar ao banco postgres em vez do sgp_db
  })

  try {
    // Desconectar todos os clientes do banco sgp_db
    await pool.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = 'sgp_db'
      AND pid <> pg_backend_pid();
    `)

    // Dropar o banco se existir
    await pool.query('DROP DATABASE IF EXISTS sgp_db')
    
    // Criar o banco novamente
    await pool.query('CREATE DATABASE sgp_db')
    
    console.log('✅ Banco de dados recriado com sucesso!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Erro ao recriar banco de dados:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

dropDatabase() 