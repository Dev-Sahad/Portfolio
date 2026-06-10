import { NextResponse } from 'next/server'

type ContactPayload = {
  name?: string
  email?: string
  message?: string
  page?: string
  userAgent?: string
}

const clean = (value: unknown) =>
  typeof value === 'string' ? value.trim().slice(0, 1000) : ''

export async function POST(request: Request) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL

  if (!webhookUrl) {
    return NextResponse.json(
      { error: 'Discord webhook is not configured.' },
      { status: 500 },
    )
  }

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

  const discordRes = await fetch(webhookUrl, {
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

  if (!discordRes.ok) {
    return NextResponse.json(
      { error: 'Failed to send Discord notification.' },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true })
}
