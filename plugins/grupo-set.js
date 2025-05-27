import fs from 'fs/promises'
import path from 'path'

const CONFIG_FILE = path.resolve('./src/configuraciones.txt')

async function readConfigTypes() {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf-8')
    return data.split('\n').map(line => line.trim()).filter(Boolean)
  } catch {
    // Si no existe el archivo, devuelve lista vacía
    return []
  }
}

async function addConfigType(type) {
  const types = await readConfigTypes()
  if (!types.includes(type)) {
    types.push(type)
    await fs.writeFile(CONFIG_FILE, types.join('\n'), 'utf-8')
  }
}

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

      // Guardar tipo en archivo
      await addConfigType(type)

      return conn.reply(m.chat, `╰⊱💚⊱ *ÉXITO* ⊱💚⊱╮\n\n✅ *Imagen de ${type.toUpperCase()} (${name}) configurada correctamente.*`, m)
    }

    if (value) {
      chat.configs[type][name] = { type: 'text', content: value }

      // Guardar tipo en archivo
      await addConfigType(type)

      return conn.reply(m.chat, `╰⊱💚⊱ *ÉXITO* ⊱💚⊱╮\n\n✅ *Texto de ${type.toUpperCase()} (${name}) configurado correctamente.*`, m)
    }

    throw `⊱❗️⊱ *ACCIÓN MAL USADA* ⊱❗️⊱╮\n\n❌ Envía un texto o responde a una imagen para configurar ${type.toUpperCase()} con el nombre "${name}".`
  }

  // Si no es 'set', verificar si el comando está permitido leyendo el archivo
  const allowedCommands = await readConfigTypes()

  if (!allowedCommands.includes(command.toLowerCase())) {
    return // No hacer nada si no está en la lista
  }

  // Comando válido, mostrar configuraciones
  const type = command.toLowerCase()
  const nameRaw = args[0]
  const name = nameRaw ? nameRaw.toLowerCase() : null

  let configsOfType = chat.configs[type]
  if (!configsOfType) return // No responder si el tipo no existe

  if (!name) {
    // Si solo se usa ".pagos", mostrar claves disponibles
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

handler.command = ['set', /^\w+$/i] // 'set' para configurar y cualquier palabra para mostrar, pero con filtro de archivo
handler.group = true
handler.admin = true

export default handler
