let handler = async (m, { conn, usedPrefix, command, args }) => {
  const type = command.toLowerCase()
  const nameRaw = args[0]
  const name = nameRaw ? nameRaw.toLowerCase() : null

  if (!name) {
    return m.reply(`╰⊱❌⊱ *USO INCORRECTO* ⊱❌⊱╮\n\nDebes especificar el nombre de la configuración.\nEjemplo:\n${usedPrefix}${type} general`)
  }

  let chat = global.db.data.chats[m.chat] || {}
  let configs = chat.configs || {}
  let configsOfType = configs[type] || {}
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
        `📌 *${type.toUpperCase()} - ${name}*`,
        m
      )
    } catch {
      return m.reply(`╰⊱❌⊱ *ERROR* ⊱❌⊱╮\n\nError al enviar la imagen configurada para *${type.toUpperCase()} (${name})*.`)
    }
  } else if (entry.type === 'text') {
    return m.reply(entry.content)
  }
}

handler.command = /^[a-z0-9_-]+$/i
handler.group = true

export default handler
