import { generateWAMessageFromContent } from '@whiskeysockets/baileys' 
import * as fs from 'fs'

var handler = async (m, { conn, text, participants }) => {

  if (!m.quoted && !text) return conn.reply(m.chat, `${lenguajeGB['smsAvisoMG']()} 𝙔 𝙀𝙇 𝙏𝙀𝙓𝙏𝙊?`, m)

  try { 

    let users = participants.map(u => conn.decodeJid(u.id))
    let quoted = m.quoted ? m.quoted : null
    let htextos = text || (quoted?.message?.conversation || quoted?.message?.extendedTextMessage?.text) || ""

    if (quoted) {
      let mime = (quoted.msg || quoted).mimetype || ''
      let isMedia = /image|video|sticker|audio/.test(mime)
      let mediaBuffer = null

      if (isMedia) mediaBuffer = await quoted.download?.()

      if (isMedia && mediaBuffer) {
        if (quoted.mtype === 'imageMessage') {
          await conn.sendMessage(m.chat, { image: mediaBuffer, caption: htextos, mentions: users }, { quoted: m })
        } else if (quoted.mtype === 'videoMessage') {
          await conn.sendMessage(m.chat, { video: mediaBuffer, caption: htextos, mimetype: 'video/mp4', mentions: users }, { quoted: m })
        } else if (quoted.mtype === 'audioMessage') {
          await conn.sendMessage(m.chat, { audio: mediaBuffer, mimetype: 'audio/mp4', fileName: 'audio.mp3', mentions: users }, { quoted: m })
        } else if (quoted.mtype === 'stickerMessage') {
          await conn.sendMessage(m.chat, { sticker: mediaBuffer, mentions: users }, { quoted: m })
        } else {
          await conn.sendMessage(m.chat, { extendedTextMessage: { text: htextos, contextInfo: { mentionedJid: users } } }, { quoted: m })
        }
      } else {
        // No media, solo texto
        await conn.sendMessage(m.chat, { extendedTextMessage: { text: htextos, contextInfo: { mentionedJid: users } } }, { quoted: m })
      }
    } else {
      // No mensaje citado, solo texto
      await conn.sendMessage(m.chat, { extendedTextMessage: { text: htextos, contextInfo: { mentionedJid: users } } }, { quoted: m })
    }

  } catch (e) {
    console.log('Error en hidetag:', e)
    await conn.reply(m.chat, 'Ocurrió un error al ejecutar el comando.', m)
  }

}

handler.command = /^(hidetag|notificar|notify|viso|aviso)$/i
handler.group = true
handler.admin = true
export default handler
