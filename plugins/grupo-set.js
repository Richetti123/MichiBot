import fs from 'fs/promises'
import path from 'path'

const CONFIG_FILE = path.resolve('./src/configuraciones.json')

async function readConfigTypes() {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function addConfigType(type) {
  const types = await readConfigTypes()
  if (!types.includes(type)) {
    types.push(type)
    await fs.writeFile(CONFIG_FILE, JSON.stringify(types, null, 2), 'utf-8')
  }
}

let handler = async (m, { conn, usedPrefix, command, args }) => {
  let chat = global.db.data.chats[m.chat] ||= {}
  chat.configs ||= {}

  // Configurar: .setcfg, .setconfig, .s, .set
  if (command.match(/^(setcfg|setconfig|s|set)$/i)) {
    if (args.length < 2) {
      throw `╰⊱❗️⊱ *USO INCORRECTO* ⊱❗️⊱╮\n\nEjemplo:\n${usedPrefix}${command} pagos jair\n${usedPrefix}${command} combos general`
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

      await addConfigType(type)

      return conn.reply(m.chat, `╰⊱💚⊱ *ÉXITO* ⊱💚⊱╮\n\n✅ *Imagen de ${type.toUpperCase()} (${name}) configurada correctamente.*`, m)
    }

    if (value) {
      chat.configs[type][name] = { type: 'text', content: value }

      await addConfigType(type)

      return conn.reply(m.chat, `╰⊱💚⊱ *ÉXITO* ⊱💚⊱╮\n\n✅ *Texto de ${type.toUpperCase()} (${name}) configurado correctamente.*`, m)
    }

    throw `⊱❗️⊱ *ACCIÓN MAL USADA* ⊱❗️⊱╮\n\n❌ Envía un texto o responde a una imagen para configurar ${type.toUpperCase()} con el nombre "${name}".`
  }

  // Ver configuraciones: .vercfg, .verconfig, .v
  if (command.match(/^(vercfg|verconfig|v)$/i)) {
    const allowedCommands = await readConfigTypes()

    const typeRaw = args[0]
    if (!typeRaw) {
      return m.reply(`╰⊱❗️⊱ *USO INCORRECTO* ⊱❗️⊱╮\n\nUsa:\n${usedPrefix}${command} <tipo> [nombre]\n\nEjemplo:\n${usedPrefix}${command} pagos\n${usedPrefix}${command} pagos general`)
    }

    const type = typeRaw.toLowerCase()
    if (!allowedCommands.includes(type)) return m.reply(`╰⊱❌⊱ *NO CONFIGURADO* ⊱❌⊱╮\n\nEl apartado "${type}" no está configurado.`)

    let configsOfType = chat.configs[type]
    if (!configsOfType) return m.reply(`╰⊱📭⊱ *VACÍO* ⊱📭⊱╮\n\nNo hay configuraciones para *${type.toUpperCase()}*.`)

    const nameRaw = args[1]
    const name = nameRaw ? nameRaw.toLowerCase() : null

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
          `AQUÍ TIENES LOS *${type.toUpperCase()} DE ${name}*`,
          m
        )
      } catch {
        return m.reply(`╰⊱❌⊱ *ERROR* ⊱❌⊱╮\n\nError al enviar la imagen configurada para *${type.toUpperCase()} (${name})*.`)
      }
    } else if (entry.type === 'text') {
      return m.reply(entry.content)
    }
  }

  // Listar todo lo configurado: .listcfg, .listconfig, .listacfg, .listaconfig
  if (command.match(/^(listcfg|listconfig|listacfg|listaconfig)$/i)) {
    const allConfigs = chat.configs
    let response = '╰⊱📋⊱ *CONFIGURACIONES EN ESTE GRUPO* ⊱📋⊱╮\n\n'
    let count = 0

    for (let type in allConfigs) {
      for (let name in allConfigs[type]) {
        response += `.vercfg ${type} ${name}\n`
        count++
      }
    }

    if (count === 0) {
      return m.reply(`╰⊱📭⊱ *VACÍO* ⊱📭⊱╮\n\nNo hay configuraciones guardadas.`)
    }

    return m.reply(response)
  }
}

handler.command = [
  /^setcfg$/i, /^setconfig$/i, /^s$/i, /^set$/i,
  /^listcfg$/i, /^listconfig$/i, /^listacfg$/i, /^listaconfig$/i,
  /^vercfg$/i, /^verconfig$/i, /^v$/i
]
handler.group = true
handler.admin = true

export default handler
