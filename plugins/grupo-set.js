let handler = async (m, { conn, command, args }) => {
  let chat = global.db.data.chats[m.chat] ||= {}
  chat.configs ||= {}

  if (command === 'set') {
    // Comando para configurar
    if (args.length < 2) {
      throw `╰⊱❗️⊱ *USO INCORRECTO* ⊱❗️⊱╮\n\nEjemplo:\n.set pagos general\n.set combos oferta`
    }

    const [typeRaw, nameRaw, ...rest] = args
    const type = typeRaw.toLowerCase()
    const name = nameRaw.toLowerCase()
    const value = rest.join(' ').trim()

    chat.configs[type] ||= {}

    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ''

    if (mime.startsWith('image')) {
      let buffer = await q.download()
      if (!buffer) throw '╰⊱❌⊱ *ERROR* ⊱❌⊱╮\n\n❌ No se pudo descargar la imagen.'
      let base64 = buffer.toString('base64')
      chat.configs[type][name] = { type: 'image', content: base64 }

      return conn.reply(m.chat, `╰⊱💚⊱ *ÉXITO* ⊱💚⊱╮\n\n✅ *Imagen de ${type.toUpperCase()} (${name}) configurada correctamente.*`, m)
    }

    if (value) {
      chat.configs[type][name] = { type: 'text', content: value }
      return conn.reply(m.chat, `╰⊱💚⊱ *ÉXITO* ⊱💚⊱╮\n\n✅ *Texto de ${type.toUpperCase()} (${name}) configurado correctamente.*`, m)
    }

    throw `⊱❗️⊱ *ACCIÓN MAL USADA* ⊱❗️⊱╮\n\n❌ Envía un texto o responde a una imagen para configurar ${type.toUpperCase()} con el nombre "${name}".`
  }

  // Si no es .set, intentamos responder con configuraciones guardadas
  let text = m.text?.trim().toLowerCase()
  if (!text) return

  // Dividir en palabras para extraer tipo y nombre
  let [type, name, ...rest] = text.split(' ')
  if (!type) return

  let configsOfType = chat.configs[type]
  if (!configsOfType) return // No hay configuraciones para ese tipo

  if (!name) {
    // Si sólo dice ".pagos" sin nombre, lista configuraciones disponibles
    let keys = Object.keys(configsOfType)
    if (!keys.length) return conn.reply(m.chat, `╰⊱📭⊱ *VACÍO* ⊱📭⊱╮\n\nNo hay configuraciones para *${type.toUpperCase()}*.`)
    return conn.reply(m.chat, `╰⊱📌⊱ *DISPONIBLES* ⊱📌⊱╮\n\nConfiguraciones para *${type.toUpperCase()}*:\n${keys.map(k => `◦ ${k}`).join('\n')}`, m)
  }

  let entry = configsOfType[name]
  if (!entry || !entry.content) return // No configurado, no responder para no interferir

  if (entry.type === 'image') {
    try {
      let buffer = Buffer.from(entry.content, 'base64')
      await conn.sendFile(
        m.chat,
        buffer,
        `${type}-${name}.jpg`,
        `📌 *${type.toUpperCase()} - ${name}*`,
        m
      )
    } catch {
      return conn.reply(m.chat, `╰⊱❌⊱ *ERROR* ⊱❌⊱╮\n\nError al enviar la imagen configurada para *${type.toUpperCase()} (${name})*.`)
    }
  } else if (entry.type === 'text') {
    return conn.reply(m.chat, entry.content, m)
  }
}

handler.command = ['set', /^\w+$/i]  // .set para configurar, cualquier palabra para responder
handler.group = true
handler.admin = true

export default handler
