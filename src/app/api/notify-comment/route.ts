import { NextRequest, NextResponse } from 'next/server'
import {
  getWebhookDelivery,
  renderWebhookMessage,
  sendDiscordWebhook,
} from '@/lib/webhookSettings'

const clean = (value: unknown, limit = 1000) =>
  typeof value === 'string' ? value.trim().slice(0, limit) : ''

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const name = clean(payload.name, 100)
    const comment = clean(payload.comment, 1000)
    const imageUrl = clean(payload.imageUrl, 1000)

    if (!name || !comment) {
      return NextResponse.json({ error: 'Missing name or comment' }, { status: 400 })
    }

    const { url: webhookUrl, message: customMessage } = await getWebhookDelivery('comments')

    // ── Discord embed ─────────────────────────────────────────────
    await sendDiscordWebhook(webhookUrl, {
        content: renderWebhookMessage(customMessage, { name, comment }, `New portfolio comment from ${name}`),
        allowed_mentions: { parse: [] },
        embeds: [{
          title: '💬 New Comment on Your Portfolio',
          color: 0x7c3aed,
          fields: [
            { name: '👤 From',    value: `**${name}**`, inline: true },
            { name: '💬 Message', value: comment.slice(0, 1024), inline: false },
            ...(imageUrl ? [{ name: '🖼️ Image', value: imageUrl.slice(0, 1024), inline: false }] : []),
          ],
          footer: { text: 'portfolio-v1 · Comments' },
          timestamp: new Date().toISOString(),
        }],
      })

    return NextResponse.json({
      ok: true,
      deliveries: { discord: true },
    })
  } catch (err: unknown) {
    console.error('Comment webhook delivery failed:', err)
    return NextResponse.json(
      { error: 'Unable to deliver the comment notification right now.' },
      { status: 502 },
    )
  }
}
