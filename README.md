# Sistema de Gerenciamento de Processos (SGP)

![Status do Projeto](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow)
![Versão](https://img.shields.io/badge/Versão-1.0.0-blue)
![Licença](https://img.shields.io/badge/Licença-MIT-green)

## 📋 Sobre o Projeto

Sistema web moderno para gerenciamento de processos empresariais, permitindo o controle, acompanhamento e otimização de fluxos de trabalho. O sistema oferece uma interface intuitiva e elegante para criação, monitoramento e análise de processos organizacionais.

### 🎯 Objetivos Principais
- Automatizar fluxos de trabalho
- Aumentar a eficiência operacional
- Melhorar a visibilidade dos processos
- Facilitar a tomada de decisões

### ⚡ Status do Desenvolvimento

#### ✅ Concluído
- [x] Configuração do ambiente de desenvolvimento
- [x] Estrutura base do projeto com Next.js 14
- [x] Sistema de autenticação com NextAuth.js
- [x] Layout moderno e responsivo
- [x] Banco de dados PostgreSQL
- [x] Cadastro de clientes (PF/PJ)

#### 🚧 Em Desenvolvimento
- [ ] Gestão de processos
- [ ] Dashboard analítico
- [ ] Relatórios
- [ ] Gestão de documentos

## 🚀 Tecnologias Utilizadas

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Lucide Icons
- React Query

### Backend
- Node.js
- PostgreSQL
- NextAuth.js
- Zod

### DevOps
- Docker
- Git

## 💻 Pré-requisitos

- Node.js (v18.0.0 ou superior)
- PostgreSQL (v14.0 ou superior)
- Docker (opcional)

## 🔧 Instalação

1. Clone o repositório
```bash
git clone [URL_DO_REPOSITORIO]
cd sistema-js
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Inicie o banco de dados
```bash
docker-compose up -d
```

5. Execute as migrações
```bash
npm run setup-db
```

6. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

## 📦 Estrutura do Projeto

```
src/
├── app/                    # Rotas e páginas
│   ├── (auth)/            # Rotas autenticadas
│   ├── api/               # Endpoints da API
│   └── layout.tsx         # Layout principal
├── components/            # Componentes React
│   ├── layout/           # Componentes de layout
│   └── ui/               # Componentes de UI
├── lib/                  # Utilitários e configurações
└── styles/              # Estilos globais
```

## 🔐 Autenticação

O sistema utiliza NextAuth.js para autenticação, com suporte a:
- Login com email/senha
- Sessões JWT
- Proteção de rotas
- Níveis de acesso (Admin, Manager, User)

## 👥 Módulo de Clientes

### Funcionalidades
- Cadastro de Pessoa Física e Jurídica
- Gestão de informações básicas e endereço
- Validação de dados com Zod
- Interface moderna e responsiva
- Busca e filtros avançados

### Campos Principais
- Nome/Razão Social
- CPF/CNPJ
- Email
- Telefone
- Endereço completo
- Observações

## 📝 Convenções de Código

- ESLint para linting
- Prettier para formatação
- TypeScript strict mode
- Conventional Commits

## 🤝 Como Contribuir

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add: nova funcionalidade'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE.md](LICENSE.md) para mais detalhes.

## 📞 Suporte

Em caso de dúvidas ou problemas, abra uma issue ou entre em contato através do email: [SEU_EMAIL]