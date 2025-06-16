import fs from 'fs/promises'
import path from 'path'

const CONFIG_FILE = path.resolve('./src/configuraciones.json')
const BACKUP_DIR = path.resolve('./src/backupsconfig/')
const confirmDeletes = {}  // Para confirmación de borrado
const confirmSets = {}     // Para confirmación de sobrescritura en set
const confirmImports = {}  // Para confirmación de sobrescritura en import

// Asegura que la carpeta de backups exista
async function ensureBackupDir() {
  try {
    await fs.access(BACKUP_DIR)
  } catch {
    await fs.mkdir(BACKUP_DIR, { recursive: true })
  }
}

// Normaliza nombre para que 'general', 'grupo', 'grupal' sean equivalentes
function normalizeName(name) {
  if (!name) return 'general'
  const n = name.toLowerCase()
  if (['general', 'grupo', 'grupal'].includes(n)) return 'general'
  return n
}

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

async function saveConfigTypes(types) {
  await fs.writeFile(CONFIG_FILE, JSON.stringify(types, null, 2), 'utf-8')
}

let handler = async (m, { conn, usedPrefix, command, args, isAdmin }) => {
  let chat = global.db.data.chats[m.chat] ||= {}
  chat.configs ||= {}

  const typeRaw = args[0]?.toLowerCase()
  let nameRaw = args[1] || ''
  const type = typeRaw
  const name = normalizeName(nameRaw)

  // -- SET CONFIG --
  if (command.match(/^(setcfg|setconfig|s|set)$/i)) {
    if (!type) throw `╰⊱❗️⊱ *USO INCORRECTO* ⊱❗️⊱╮\n\nEjemplo:\n${usedPrefix}${command} pagos general texto a guardar\nO para imagen y texto:\n${usedPrefix}${command} pagos general texto_imagen texto_a_guardar`

    const rest = args.slice(2)
    let value = rest.join(' ').trim()

    chat.configs[type] ||= {}

    // Revisar si ya existe configuración para ese tipo+nombre
    let exists = chat.configs[type][name]

    // Si existe y no hay confirmación previa, pide confirmación
    if (exists && !confirmSets[m.sender]) {
      if (exists.author !== m.sender) {
        return conn.reply(m.chat, `❌ Solo quien configuró *${type.toUpperCase()} (${name})* puede modificarla.`, m)
      }
      confirmSets[m.sender] = { type, name, value }
      return conn.reply(m.chat, `⚠️ Ya existe configuración para *${type.toUpperCase()} (${name})*.\nSi quieres cambiarla, vuelve a enviar el mismo comando para confirmar.`, m)
    }

    // Si ya pidió confirmación pero cambió tipo o nombre, se actualiza confirmación
    if (confirmSets[m.sender] && (confirmSets[m.sender].type !== type || confirmSets[m.sender].name !== name)) {
      if (exists.author !== m.sender) {
        return conn.reply(m.chat, `❌ Solo quien configuró *${type.toUpperCase()} (${name})* puede modificarla.`, m)
      }
      confirmSets[m.sender] = { type, name, value }
      return conn.reply(m.chat, `⚠️ Confirmación cambiada.\nSi quieres cambiar la configuración *${type.toUpperCase()} (${name})*, vuelve a enviar el comando.`, m)
    }

    // Ahora manejar la configuración
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ''

    // Tipos permitidos: image, text, image_text
    // Detectar qué tipo quiere guardar:
    // Si mime es imagen y value está vacío: guardar solo imagen
    // Si mime no es imagen y value tiene texto: solo texto
    // Si mime es imagen y value tiene texto: imagen y texto

    let configToSave = null
    if (mime.startsWith('image') && value) {
      // imagen y texto
      let buffer = await q.download()
      if (!buffer) throw '❌ No se pudo descargar la imagen.'
      let base64 = buffer.toString('base64')
      configToSave = { type: 'image_text', image: base64, text: value, author: m.sender }
    } else if (mime.startsWith('image')) {
      // solo imagen
      let buffer = await q.download()
      if (!buffer) throw '❌ No se pudo descargar la imagen.'
      let base64 = buffer.toString('base64')
      configToSave = { type: 'image', content: base64, author: m.sender }
    } else if (value) {
      // solo texto
      configToSave = { type: 'text', content: value, author: m.sender }
    } else {
      throw `❌ Envía
