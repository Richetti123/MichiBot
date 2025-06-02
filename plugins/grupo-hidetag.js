import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

var handler = async (m, { conn, text, participants }) => {
  if (!m.quoted && !text) return conn.reply(m.chat, '❗️ Debes enviar texto o responder a un mensaje.', m)

  let users = participants.map(u => conn.decodeJid(u.id))

  let htextos = ''
  if (m.quoted) {
    htextos = m.quoted.text || m.quoted.contentText || ''
  }
  if (!htextos) {
    htextos = text || ''
  }
  if (!htextos) htextos = 'MichiBot'

  try {
    let q = m.quoted ? m.quoted : m
    let c = m.quoted ? await m.getQuotedObj() : m.msg || m

    // Validar mtype
    let mtype = q.mtype
    let content = c.message && mtype && c.message[mtype] ? c.message[mtype] : null

    // Si no hay contenido válido, usar texto simple
    if (!content) {
      content = { text: htextos }
      mtype = 'extendedTextMessage'
    }

    let msg = conn.cMod(
      m.chat,
      generateWAMessageFromContent(
        m.chat,
        { [mtype]: content },
        { quoted: null, userJid: conn.user.id }
      ),
      htextos,
      conn.user.jid,
      { mentions: users }
    )
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

  } catch (e) {
    // En caso de error, enviar texto plano con menciones
    await conn.sendMessage(
      m.chat,
      { extendedTextMessage: { text: htextos, contextInfo: { mentionedJid: users } } },
      { quoted: m }
    )
  }
}

handler.command = /^(hidetag|notificar|notify|viso|aviso)$/i
handler.group = true
handler.admin = true

export default handler
