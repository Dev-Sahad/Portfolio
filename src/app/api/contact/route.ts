import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import {
  getWebhookDelivery,
  renderWebhookMessage,
  sendDiscordWebhook,
} from '@/lib/webhookSettings'
import { getServiceDatabase } from '@/lib/supabaseAdmin'

type ContactPayload = {
  name?: string
  email?: string
  message?: string
  page?: string
  userAgent?: string
}

const clean = (value: unknown) =>
  typeof value === 'string' ? value.trim().slice(0, 1000) : ''

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[character] || character)

async function sendEmail(name: string, senderEmail: string, message: string) {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASSWORD) {
      return false
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASSWORD },
    })

    const mailOptions = {
      from: process.env.SMTP_USER || process.env.GMAIL_USER || 'noreply@portfolio.dev',
      to: process.env.CONTACT_TO_EMAIL || 'dev.sxhd@gmail.com',
      replyTo: senderEmail,
      subject: `New Contact Form Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; color: white;">
            <h1 style="margin: 0; font-size: 24px;">New Contact Form Message</h1>
          </div>
          <div style="border: 1px solid #ddd; padding: 20px; border-radius: 0 0 10px 10px;">
            <p><strong>From:</strong> ${escapeHtml(name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(senderEmail)}</p>
            <p><strong>Message:</strong></p>
            <p style="background: #f5f5f5; padding: 15px; border-left: 4px solid #667eea; border-radius: 5px; white-space: pre-wrap;">
              ${escapeHtml(message)}
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="font-size: 12px; color: #999;">
              This email was sent from your portfolio contact form.
            </p>
          </div>
        </div>
      `,
      text: `New message from ${name} (${senderEmail}):\n\n${message}`,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent:', info.messageId)
    
    // For test account, log the preview URL
    if (process.env.NODE_ENV === 'development' && !process.env.SMTP_USER) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info))
    }

    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as ContactPayload
  const name = clean(body.name)
  const email = clean(body.email)
  const message = clean(body.message)
  const page = clean(body.page)
  const userAgent = clean(body.userAgent)

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: 'Name, email, and message are required.' },
      { status: 400 },
    )
  }

  const database = getServiceDatabase()
  if (database) {
    await Promise.all([
      database.from('contact_messages').insert({
        name,
        email,
        message,
        page: page || null,
      }),
      database.from('analytics_events').insert({
        event_type: 'contact_submit',
        path: page || '/#contact',
        metadata: {},
      }),
    ])
  }

  // Admin settings override the server environment value after the migration is applied.
  const { url: webhookUrl, message: customMessage } = await getWebhookDelivery('contact')
  const webhookPayload = {
    username: 'Portfolio Contact',
    content: renderWebhookMessage(
      customMessage,
      { name, email, message },
      `New portfolio message from ${name}`,
    ),
    allowed_mentions: { parse: [] },
    embeds: [
      {
        title: 'New Portfolio Message',
        color: 0xffffff,
        author: {
          name: name.slice(0, 256),
        },
        description: message.slice(0, 3900),
        fields: [
          {
            name: 'Viewer Name',
            value: name.slice(0, 1024),
            inline: true,
          },
          {
            name: 'Email',
            value: email.slice(0, 1024),
            inline: true,
          },
          {
            name: 'Page',
            value: (page || 'Unknown').slice(0, 1024),
            inline: false,
          },
          {
            name: 'Browser',
            value: (userAgent || 'Unknown').slice(0, 1024),
            inline: false,
          },
        ],
        footer: {
          text: 'Sent from the portfolio contact form',
        },
        timestamp: new Date().toISOString(),
      },
    ],
  }

  // Discord is the primary notification channel. Gmail is optional and must not
  // prevent a configured webhook from receiving the contact message.
  const [webhookResult, emailResult] = await Promise.allSettled([
    sendDiscordWebhook(webhookUrl, webhookPayload),
    sendEmail(name, email, message),
  ])

  if (webhookResult.status === 'rejected') {
    console.error('Contact webhook delivery failed:', webhookResult.reason)
    return NextResponse.json(
      { error: 'Unable to deliver your message right now.' },
      { status: 502 },
    )
  }

  return NextResponse.json({
    ok: true,
    deliveries: {
      discord: true,
      email: emailResult.status === 'fulfilled' && emailResult.value,
    },
  })
}
