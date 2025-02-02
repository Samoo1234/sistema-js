# Guia de Solução de Problemas

## Índice
1. [Erro de Sequência no PostgreSQL com Next.js e NextAuth](#1-erro-de-sequência-no-postgresql-com-nextjs-e-nextauth)
2. [Erro no Cadastro de Clientes - Internal Error](#2-erro-no-cadastro-de-clientes---internal-error)

## 1. Erro de Sequência no PostgreSQL com Next.js e NextAuth

### Sintomas
1. Erro ao criar tabelas: `duplicar valor da chave viola a restrição de unicidade "pg_class_relname_nsp_index"`
2. Erro específico com a sequência: `Chave (relname, relnamespace)=(users_id_seq, 2200) já existe`
3. Problemas com autenticação devido a conflitos de namespace no PostgreSQL

### Solução Implementada
1. **Criar um Schema Dedicado**
   ```sql
   CREATE SCHEMA IF NOT EXISTS app
   ```

2. **Usar o Schema nas Tabelas**
   ```sql
   CREATE TABLE IF NOT EXISTS app.users (
     id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
     ...
   )
   ```

3. **Atualizar Referências nas Queries**
   - Mudar de `SELECT * FROM users` para `SELECT * FROM app.users`
   - Atualizar todas as referências de tabela para incluir o schema `app.`

4. **Script de Limpeza**
   ```typescript
   // Conectar ao banco postgres (não ao banco da aplicação)
   const pool = new Pool({
     database: 'postgres'
   })
   
   // Dropar e recriar o banco
   await pool.query('DROP DATABASE IF EXISTS sgp_db')
   await pool.query('CREATE DATABASE sgp_db')
   ```

### Passos para Resolver
1. Parar o servidor
2. Dropar o banco de dados completamente
3. Recriar o banco de dados
4. Executar o script de setup com o novo schema
5. Reiniciar o servidor

### Por que Funcionou?
1. O schema separado evita conflitos com objetos do sistema
2. `GENERATED ALWAYS AS IDENTITY` é mais seguro que `SERIAL`
3. Namespace isolado previne colisões com outras aplicações
4. Melhor organização do banco de dados

### Prevenção Futura
1. Sempre usar schemas dedicados para aplicações
2. Evitar usar o schema `public` para tabelas da aplicação
3. Manter scripts de migração e setup atualizados
4. Documentar a estrutura do banco de dados

### Comandos Úteis
```bash
# Recriar banco
npm run drop-db

# Setup inicial
npm run setup-db

# Limpar cache Next.js
rm -rf .next
```

Esta solução resolve problemas de:
- Conflitos de sequência no PostgreSQL
- Namespace compartilhado
- Gerenciamento de identidade de colunas
- Organização do banco de dados 

## 2. Erro no Cadastro de Clientes - Internal Error

### Sintomas
1. Erro ao tentar cadastrar um cliente: `Unexpected token 'I', "Internal error" is not valid JSON`
2. No console do servidor: `error: relação "Client" não existe`
3. Erro 500 nas requisições para `/api/clients`

### Causa
O erro ocorre porque as queries na API de clientes estão usando o nome da tabela sem o schema `app` que criamos anteriormente.

### Solução
Atualizar todas as queries na API de clientes para usar o schema correto:

```typescript
// Antes
const result = await query('SELECT * FROM clients WHERE ...')

// Depois
const result = await query('SELECT * FROM app.clients WHERE ...')
```

### Arquivos Afetados
- `src/app/api/clients/route.ts`

### Prevenção Futura
1. Sempre usar o schema `app.` em todas as queries
2. Criar constantes para os nomes das tabelas com o schema incluído
3. Usar um helper de query builder para garantir consistência
4. Adicionar testes para verificar se as queries estão usando o schema correto

### Comandos Úteis
```bash
# Verificar estrutura atual do banco
psql -U postgres -d sgp_db -c "\dt app.*"

# Verificar definição da tabela
psql -U postgres -d sgp_db -c "\d app.clients"
``` 