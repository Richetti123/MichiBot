import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

var handler = async (m, { conn, text, participants }) => {
  if (!m.quoted && !text) 
    return conn.reply(m.chat, `❗️ Por favor responde a un mensaje o escribe un texto.`, m)

  let users = participants.map(u => conn.decodeJid(u.id))
  let quoted = m.quoted ? m.quoted : null

  // Texto que enviar: texto del comando o texto del mensaje citado o texto por defecto
  let htextos = text || (quoted?.text || quoted?.message?.conversation) || "MichiBot"

  try {
    if (quoted) {
      let mime = (quoted.msg || quoted).mimetype || ''
      let isMedia = /image|video|audio|sticker/.test(mime)
      let mediaBuffer = null

      if (isMedia) {
        // Descargar media
        mediaBuffer = await quoted.download?.()
      }

      if (isMedia && mediaBuffer) {
        // Detectar el tipo de medio y enviar con la mención y el texto (caption)
        if (mime.startsWith('image')) {
          await conn.sendMessage(m.chat, { image: mediaBuffer, caption: htextos, mentions: users }, { quoted: m })
        } else if (mime.startsWith('video')) {
          await conn.sendMessage(m.chat, { video: mediaBuffer, caption: htextos, mimetype: 'video/mp4', mentions: users }, { quoted: m })
        } else if (mime.startsWith('audio')) {
          await conn.sendMessage(m.chat, { audio: mediaBuffer, mimetype: 'audio/mp4', fileName: 'audio.mp3', mentions: users }, { quoted: m })
        } else if (mime.includes('sticker')) {
          await conn.sendMessage(m.chat, { sticker: mediaBuffer, mentions: users }, { quoted: m })
        } else {
          // En caso de medio desconocido, envía solo texto con menciones
          await conn.sendMessage(m.chat, { extendedTextMessage: { text: htextos, contextInfo: { mentionedJid: users } } }, { quoted: m })
        }
      } else {
        // Si no es medio, enviar texto con menciones (puede ser texto plano o extendedTextMessage)
        await conn.sendMessage(
          m.chat, 
          { extendedTextMessage: { text: htextos, contextInfo: { mentionedJid: users } } },
          { quoted: m }
        )
      }
    } else {
      // No hay mensaje citado, solo texto, enviar texto con menciones
      await conn.sendMessage(
        m.chat, 
        { extendedTextMessage: { text: htextos, contextInfo: { mentionedJid: users } } },
        { quoted: m }
      )
    }
  } catch (e) {
    // En caso de error general, enviar texto con menciones para no quedar sin respuesta
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
