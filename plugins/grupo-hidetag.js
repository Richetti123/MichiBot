import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

var handler = async (m, { conn, text, participants }) => {
  if (!m.quoted && !text) return conn.reply(m.chat, '❗️ Debes enviar texto o responder a un mensaje.', m)

  let users = participants.map(u => conn.decodeJid(u.id))

  // Texto que vamos a usar para el mensaje reenviado:
  // Si respondes a un mensaje:
  let htextos = ''
  if (m.quoted) {
    // Intenta obtener texto del mensaje citado
    htextos = m.quoted.text || m.quoted.contentText || ''
  }
  // Si no hay texto en el mensaje citado, usa el texto que escribiste tras el comando:
  if (!htextos) {
    htextos = text || ''
  }
  if (!htextos) htextos = 'MichiBot' // fallback

  try {
    // Obtener el mensaje citado o el mismo mensaje para reenviar
    let q = m.quoted ? m.quoted : m

    // Obtener el contenido para modificar
    let c = m.quoted ? await m.getQuotedObj() : m.msg || m

    // Crear el mensaje con la mención a todos
    let msg = conn.cMod(
      m.chat,
      generateWAMessageFromContent(
        m.chat,
        {
          [m.quoted ? q.mtype : 'extendedTextMessage']: m.quoted ? c.message[q.mtype] : { text: '' }
        },
        { quoted: null, userJid: conn.user.id }
      ),
      htextos,
      conn.user.jid,
      { mentions: users }
    )
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

  } catch (e) {
    // En caso de error, responde texto plano con menciones
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
