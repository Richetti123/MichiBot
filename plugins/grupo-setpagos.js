let handler = async (m, { conn, command, text, quoted, mime }) => {
  let field = command.replace(/^set/, '').toLowerCase()
  let validFields = ['pagos', 'stock', 'reglas']

  if (!validFields.includes(field)) {
    throw '╰⊱❌⊱ ERROR ⊱❌⊱╮\n\n*COMANDO NO VÁLIDO. SOLO PUEDES USAR:* .setpagos, .setstock, .setreglas'
  }

  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}

  // Verificar si es imagen o sticker
  if ((quoted?.mimetype || mime)?.startsWith('image')) {
    let media = quoted ? quoted : m
    let buffer = await conn.download(media)

    if (!buffer) throw '╰⊱❌⊱ ERROR ⊱❌⊱╮\n\n*❌ NO SE PUDO DESCARGAR LA IMAGEN.*'

    let base64 = buffer.toString('base64')
    global.db.data.chats[m.chat][field] = {
      type: 'image',
      content: base64
    }

    return conn.reply(m.chat, `╰⊱🖼️⊱ *ÉXITO* ⊱🖼️⊱╮\n\n*IMAGEN PARA ${field.toUpperCase()} CONFIGURADA CORRECTAMENTE*`, fkontak, m)
  }

  // Si es texto plano
  if (text?.trim()) {
    global.db.data.chats[m.chat][field] = {
      type: 'text',
      content: text.trim()
    }

    return conn.reply(m.chat, `╰⊱✅⊱ *ÉXITO* ⊱✅⊱╮\n\n*TEXTO PARA ${field.toUpperCase()} CONFIGURADO CORRECTAMENTE*`, fkontak, m)
  }

  throw `╰⊱❌⊱ ERROR ⊱❌⊱╮\n\n*❌ ENVÍA UN TEXTO O RESPONDE A UNA IMAGEN PARA CONFIGURAR ${field.toUpperCase()}*`
}

handler.command = ['setpagos', 'setstock', 'setreglas']
handler.botAdmin = true
handler.admin = true
handler.group = true

export default handler
