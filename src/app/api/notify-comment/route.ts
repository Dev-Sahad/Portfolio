import { NextRequest, NextResponse } from 'next/server'

const OWNER_EMAIL     = 'dev.sxhd@gmail.com'
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK_URL

export async function POST(req: NextRequest) {
  try {
    const { name, comment, imageUrl } = await req.json()

    if (!name?.trim() || !comment?.trim()) {
      return NextResponse.json({ error: 'Missing name or comment' }, { status: 400 })
    }

    // ── Discord embed ─────────────────────────────────────────────
    if (DISCORD_WEBHOOK) await fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: '💬 New Comment on Your Portfolio',
          color: 0x7c3aed,
          fields: [
            { name: '👤 From',    value: `**${name}**`, inline: true },
            { name: '📧 Notify',  value: OWNER_EMAIL,   inline: true },
            { name: '💬 Message', value: comment,       inline: false },
            ...(imageUrl ? [{ name: '🖼️ Image', value: imageUrl, inline: false }] : []),
          ],
          footer: { text: 'portfolio-v1 · Comments' },
          timestamp: new Date().toISOString(),
        }],
      }),
    }).catch(() => null) // never block comment on webhook failure

    // ── Build mailto URL (opened on client if user wants to reply) ─
    const subject = encodeURIComponent(`Re: Comment from ${name} on your portfolio`)
    const body    = encodeURIComponent(
      `Hi ${name},\n\nThanks for your comment on my portfolio!\n\n` +
      `> "${comment}"\n\n` +
      `---\nMuhammad Sahad\nportfolio-v1-eta-nine.vercel.app`
    )

    return NextResponse.json({
      ok:        true,
      mailtoUrl: `mailto:${name}@?subject=${subject}&body=${body}`,
      ownerMail: `mailto:${OWNER_EMAIL}?subject=${encodeURIComponent(`New comment from ${name}`)}&body=${encodeURIComponent(`Name: ${name}\nComment: ${comment}`)}`,
    })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unexpected error' },
      { status: 500 },
    )
  }
}
