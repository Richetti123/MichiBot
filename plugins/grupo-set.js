let handler = async (m, { conn, args, text, command }) => {
  if (args.length < 2) {
    throw `╰⊱❗️⊱ *USO INCORRECTO* ⊱❗️⊱╮\n\n*Escribe lo que quieras configurar*\n*Ejemplo:\n.set pagos jair\n.set combos general`
  }

  const [typeRaw, nameRaw, ...rest] = args
  const type = typeRaw.toLowerCase()
  const name = nameRaw.toLowerCase()

  let value = rest.join(' ').trim()

  let chat = global.db.data.chats[m.chat] ||= {}
  chat.configs ||= {}
  chat.configs[type] ||= {}

  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''

  if (mime.startsWith('image')) {
    let buffer = await q.download()
    if (!buffer) throw '╰⊱❌⊱ *ERROR* ⊱❌⊱╮\n\n*No se pudo descargar la imagen.*'

    let base64 = buffer.toString('base64')
    chat.configs[type][name] = { type: 'image', content: base64 }

    return conn.reply(m.chat, `╰⊱💚⊱ *ÉXITO* ⊱💚⊱╮\n\n✅ *Imagen de ${type.toUpperCase()} (${name}) configurada correctamente.*`, m)
  }

  if (value) {
    chat.configs[type][name] = { type: 'text', content: value }
    return conn.reply(m.chat, `╰⊱💚⊱ *ÉXITO* ⊱💚⊱╮\n\n✅ *Texto de ${type.toUpperCase()} (${name}) configurado correctamente.*`, m)
  }

  throw `╰⊱❗️⊱ *USO INCORRECTO* ⊱❗️⊱╮\n\n *Envía un texto o responde a una imagen para configurar ${type.toUpperCase()} con el nombre "${name}".*`
}

handler.command = /^set$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
