let handler = async (m, { conn, usedPrefix, command, args }) => {
  let chat = global.db.data.chats[m.chat] ||= {}
  chat.configs ||= {}

  if (command === 'set') {
    if (args.length < 2) {
      throw `╰⊱❗️⊱ *USO INCORRECTO* ⊱❗️⊱╮\n\nEjemplo:\n.set pagos jair\n.set combos general`
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

  // Mostrar configuración
  const type = command.toLowerCase()
  const nameRaw = args[0]
  const name = nameRaw ? nameRaw.toLowerCase() : null

  let configsOfType = chat.configs[type]
  if (!configsOfType) return // No responder si el tipo no existe

  if (!name) {
    let keys = Object.keys(configsOfType)
    if (!keys.length) return m.reply(`╰⊱📭⊱ *VACÍO* ⊱📭⊱╮\n\nNo hay configuraciones para *${type.toUpperCase()}*.`)
    return m.reply(`╰⊱📌⊱ *DISPONIBLES* ⊱📌⊱╮\n\nConfiguraciones para *${type.toUpperCase()}*:\n${keys.map(k => `◦ ${k}`).join('\n')}`)
  }

  let entry = configsOfType[name]
  if (!entry || !entry.content) {
    return m.reply(`╰⊱❌⊱ *NO CONFIGURADO* ⊱❌⊱╮\n\nNo se encontró configuración para *${type.toUpperCase()} (${name})*.`)
  }

  if (entry.type === 'image') {
    try {
      let buffer = Buffer.from(entry.content, 'base64')
      await conn.sendFile(
        m.chat,
        buffer,
        `${type}-${name}.jpg`,
        `AQUI TIENES LOS *${type.toUpperCase()} DE ${name}*`,
        m
      )
    } catch {
      return m.reply(`╰⊱❌⊱ *ERROR* ⊱❌⊱╮\n\nError al enviar la imagen configurada para *${type.toUpperCase()} (${name})*.`)
    }
  } else if (entry.type === 'text') {
    return m.reply(entry.content)
  }
}

// FUNCIONALIDAD DINÁMICA:
// Solo ejecuta si es 'set' o un comando que coincide con algún tipo configurado
handler.command = async (command, m, { conn }) => {
  if (command === 'set') return true

  const chat = global.db.data.chats[m.chat] || {}
  const configs = chat.configs || {}

  return Object.keys(configs).includes(command.toLowerCase())
}

handler.group = true
handler.admin = true

export default handler
