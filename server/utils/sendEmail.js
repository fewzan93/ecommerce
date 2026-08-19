import nodemailer from 'nodemailer'

let transporter = null

function getTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return null
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }
  return transporter
}

export async function sendEmail({ to, subject, text, html }) {
  const transport = getTransporter()

  if (!transport) {
    console.warn(
      `[mail] SMTP not configured — email not sent to ${to}. Subject: ${subject}`
    )
    return false
  }

  try {
    await transport.sendMail({
      from: process.env.EMAIL_FROM || 'Ecommerce <no-reply@example.com>',
      to,
      subject,
      text,
      html,
    })
    return true
  } catch (err) {
    console.error('[mail] Failed to send email:', err.message)
    return false
  }
}