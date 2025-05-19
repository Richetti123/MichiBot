let handler = async (m, { conn, command, text, quoted, mime }) => {
  let field = command.replace(/^set/, '').toLowerCase()
  let validFields = ['pagos', 'stock', 'reglas']

  if (!validFields.includes(field)) {
    throw '*❌ COMANDO NO VÁLIDO. SOLO PUEDES USAR:* .setpagos, .setstock, .setreglas'
  }

  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}

  if ((quoted?.mimetype || mime)?.startsWith('image')) {
    let media = await conn.download(quoted || m)
    if (!media) throw '*❌ NO SE PUDO DESCARGAR LA IMAGEN.*'

    let base64 = media.toString('base64')

    global.db.data.chats[m.chat][field] = {
      type: 'image',
      content: base64
    }

    return conn.reply(m.chat, `✅ *IMAGEN DE ${field.toUpperCase()} CONFIGURADA CORRECTAMENTE*`, fkontak, m)
  }

  if (text?.trim()) {
    global.db.data.chats[m.chat][field] = {
      type: 'text',
      content: text.trim()
    }

    return conn.reply(m.chat, `✅ *TEXTO DE ${field.toUpperCase()} CONFIGURADO CORRECTAMENTE*`, fkontak, m)
  }

  throw `*❌ ENVÍA UN TEXTO O RESPONDE A UNA IMAGEN PARA CONFIGURAR ${field.toUpperCase()}*`
}

handler.command = ['setpagos', 'setstock', 'setreglas']
handler.botAdmin = true
handler.admin = true
handler.group = true

export default handler
