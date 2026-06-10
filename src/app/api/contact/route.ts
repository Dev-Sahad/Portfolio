import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

type ContactPayload = {
  name?: string
  email?: string
  message?: string
  page?: string
  userAgent?: string
}

const clean = (value: unknown) =>
  typeof value === 'string' ? value.trim().slice(0, 1000) : ''

async function sendEmail(name: string, senderEmail: string, message: string) {
  try {
    // Create a test account if no SMTP credentials are provided
    let transporter
    
    if (process.env.SMTP_USER && process.env.SMTP_PASSWORD && process.env.SMTP_HOST) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      })
    } else {
      // Fallback: use Gmail or create test account
      if (process.env.GMAIL_USER && process.env.GMAIL_PASSWORD) {
        transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASSWORD,
          },
        })
      } else {
        // Create test account (for development)
        const testAccount = await nodemailer.createTestAccount()
        transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        })
      }
    }

    const mailOptions = {
      from: process.env.SMTP_USER || process.env.GMAIL_USER || 'noreply@portfolio.dev',
      to: 'dev.sxhd@gmail.com',
      subject: `New Contact Form Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; color: white;">
            <h1 style="margin: 0; font-size: 24px;">New Contact Form Message</h1>
          </div>
          <div style="border: 1px solid #ddd; padding: 20px; border-radius: 0 0 10px 10px;">
            <p><strong>From:</strong> ${name}</p>
            <p><strong>Email:</strong> ${senderEmail}</p>
            <p><strong>Message:</strong></p>
            <p style="background: #f5f5f5; padding: 15px; border-left: 4px solid #667eea; border-radius: 5px; white-space: pre-wrap;">
              ${message}
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
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL

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

  // Send email
  await sendEmail(name, email, message)

  // Send Discord notification if webhook is configured
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'Portfolio Contact',
          content: `New portfolio message from ${name}`,
          embeds: [
            {
              title: 'New Portfolio Message',
              color: 0xffffff,
              author: {
                name,
              },
              description: message.slice(0, 3900),
              fields: [
                {
                  name: 'Viewer Name',
                  value: name,
                  inline: true,
                },
                {
                  name: 'Email',
                  value: email,
                  inline: true,
                },
                {
                  name: 'Page',
                  value: page || 'Unknown',
                  inline: false,
                },
                {
                  name: 'Browser',
                  value: userAgent || 'Unknown',
                  inline: false,
                },
              ],
              footer: {
                text: 'Sent from the portfolio contact form',
              },
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      })
    } catch (error) {
      console.error('Error sending Discord notification:', error)
    }
  }

  return NextResponse.json({ ok: true })
}
