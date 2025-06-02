import { generateWAMessageFromContent } from '@whiskeysockets/baileys'
import * as fs from 'fs'

var handler = async (m, { conn, text, participants }) => {
  if (!m.quoted && !text) 
    return conn.reply(m.chat, `${lenguajeGB['smsAvisoMG']()} 𝙔 𝙀𝙇 𝙏𝙀𝙓𝙏𝙊?`, m)

  try { 
    let users = participants.map(u => conn.decodeJid(u.id))
    let quoted = m.quoted
    let mime = (quoted?.msg || quoted)?.mimetype || ''
    let isMedia = /image|video|sticker|audio/.test(mime)

    if (quoted) {
      if (isMedia) {
        // Descarga el media citado
        let buffer = await quoted.download?.()
        if (!buffer) return conn.reply(m.chat, 'No se pudo descargar el contenido citado.', m)
        // Envía el media con menciones y texto (si hay)
        await conn.sendMessage(
          m.chat,
          { 
            [quoted.mtype.replace('Message', '')]: buffer,
            mentions: users,
            caption: text || ''
          },
          { quoted: null }
        )
      } else {
        // Texto: si hay texto nuevo, lo manda, si no, reenvía texto citado
        let originalText = quoted.text || (quoted.msg && quoted.msg.text) || ''
        let messageText = text || originalText || ''
        await conn.sendMessage(
          m.chat,
          { text: messageText, mentions: users },
          { quoted: null }
        )
      }
    } else {
      // No hay mensaje citado, enviar texto normal con menciones
      await conn.sendMessage(
        m.chat,
        { text: text, mentions: users },
        { quoted: null }
      )
    }

  } catch (e) {
    console.error(e)
    return conn.reply(m.chat, 'Ocurrió un error al intentar notificar el mensaje.', m)
  }
}

handler.command = /^(hidetag|notificar|notify|viso|aviso)$/i
handler.group = true
handler.admin = true

export default handler
