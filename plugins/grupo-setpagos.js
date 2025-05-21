let handler = async (m, { conn, text, command }) => {
  let field = command.replace(/^set/, '').toLowerCase()
  let validFields = ['pagos', 'stock', 'reglas']
  if (!validFields.includes(field)) throw '╰⊱❌⊱ *ERROR* ⊱❌⊱╮\n\n*❌ COMANDO INVÁLIDO.*'

  if (!text) throw `╰⊱❕⊱ *INFORMACIÓN* ⊱❕⊱╮\n\nDebes indicar un *nombre* para guardar el contenido de ${field}.`

  let chat = global.db.data.chats[m.chat] ||= {}
  chat[field] ||= {}

  let args = text.trim().split(/ +/)
  let name = args.shift()?.toLowerCase()
  let value = args.join(' ').trim()

  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''

  if (mime && mime.startsWith('image')) {
    let buffer = await q.download()
    if (!buffer) throw '╰⊱❌⊱ *ERROR* ⊱❌⊱╮\n\n❌ No se pudo descargar la imagen.'

    let base64 = buffer.toString('base64')
    chat[field][name] = { type: 'image', content: base64 }

    return conn.reply(m.chat, `╰⊱💚⊱ ÉXITO ⊱💚⊱╮\n\n✅ *Imagen de ${field.toUpperCase()} (${name}) configurada correctamente.*`, m)
  }

  if (value) {
    chat[field][name] = { type: 'text', content: value }
    return conn.reply(m.chat, `╰⊱💚⊱ ÉXITO ⊱💚⊱╮\n\n✅ *Texto de ${field.toUpperCase()} (${name}) configurado correctamente.*`, m)
  }

  throw `╰⊱❕⊱ *INFORMACIÓN* ⊱❕⊱╮\n\n❌ Envía un texto o responde a una imagen para configurar ${field.toUpperCase()} con un nombre.`
}

handler.command = /^set(pagos|stock|reglas)$/i
handler.botAdmin = true
handler.admin = true
handler.group = true

export default handler
