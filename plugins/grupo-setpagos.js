let handler = async (m, { conn, text, command }) => {
  let field = command.replace(/^set/, '').toLowerCase()
  let validFields = ['pagos', 'stock', 'reglas']
  if (!validFields.includes(field)) throw '╰⊱❌⊱ *ERROR* ⊱❌⊱╮\n\n*❌ COMANDO INVÁLIDO.*'

  let chat = global.db.data.chats[m.chat] ||= {}

  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''

  if (mime && mime.startsWith('image')) {
    let buffer = await q.download()
    if (!buffer) throw '╰⊱❌⊱ *ERROR* ⊱❌⊱╮\n\n*❌ NO SE PUDO DESCARGAR LA IMAGEN.*'

    let base64 = buffer.toString('base64')
    chat[field] = { type: 'image', content: base64 }

    return conn.reply(m.chat, `╰⊱💚⊱ ÉXITO ⊱💚⊱╮\n\n✅ *IMAGEN DE ${field.toUpperCase()} CONFIGURADA CORRECTAMENTE*`, m)
  }

  if (text?.trim()) {
    chat[field] = { type: 'text', content: text.trim() }
    return conn.reply(m.chat, `╰⊱💚⊱ ÉXITO ⊱💚⊱╮\n\n✅ *TEXTO DE ${field.toUpperCase()} CONFIGURADO CORRECTAMENTE*`, m)
  }

  throw `╰⊱❗️⊱ *ACCIÓN MAL USADA* ⊱❗️⊱╮\n\n❌ ENVÍA UN TEXTO O RESPONDE A UNA IMAGEN PARA CONFIGURAR ${field.toUpperCase()}`
}

handler.command = /^set(pagos|stock|reglas)$/i
handler.botAdmin = true
handler.admin = true
handler.group = true
export default handler
