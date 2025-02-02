import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { query } from './db'

interface CustomUser {
  id: string
  email: string
  name: string
  role: string
}

declare module 'next-auth' {
  interface User extends CustomUser {}
  
  interface Session {
    user: CustomUser
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends CustomUser {}
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Credenciais inválidas')
        }

        try {
          console.log('🔍 Buscando usuário:', credentials.email)
          const result = await query(
            'SELECT * FROM app.users WHERE email = $1',
            [credentials.email]
          )

          const user = result.rows[0]

          if (!user) {
            console.error('❌ Usuário não encontrado:', credentials.email)
            throw new Error('Usuário não encontrado')
          }

          const isValidPassword = await compare(credentials.password, user.password)

          if (!isValidPassword) {
            console.error('❌ Senha incorreta para usuário:', credentials.email)
            throw new Error('Senha incorreta')
          }

          console.log('✅ Login bem sucedido:', user.email)
          
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role
          }
        } catch (error) {
          console.error('❌ Erro na autenticação:', error)
          throw new Error('Erro ao autenticar usuário')
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.name = token.name
        session.user.role = token.role
      }
      return session
    }
  }
} 