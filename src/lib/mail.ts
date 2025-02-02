import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendProcessCredentials(email: string, name: string, token: string, password: string) {
  const html = `
    <h1>Olá ${name},</h1>
    <p>Seu processo foi cadastrado com sucesso no Sistema de Gerenciamento de Processos.</p>
    <p>Para acompanhar o andamento do seu processo, utilize as credenciais abaixo:</p>
    <p><strong>Token de Acesso:</strong> ${token}</p>
    <p><strong>Senha:</strong> ${password}</p>
    <p>Acesse o sistema através do link: <a href="${process.env.NEXT_PUBLIC_APP_URL}/acompanhamento">Acompanhar Processo</a></p>
    <p>Atenciosamente,<br>Equipe SGP</p>
  `

  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"SGP - Sistema de Gerenciamento de Processos" <noreply@sgp.com>',
    to: email,
    subject: 'Credenciais de Acesso - SGP',
    html,
  })
} 