let handler = async (m, { conn, usedPrefix, command, args: [event], text }) => {
  if (!event) {
    return m.reply(`${mid.smsMalused7}

${usedPrefix + command} stock
${usedPrefix + command} pagos
${usedPrefix + command} reglas`)
  }

  let mentions = text.replace(event, '').trimStart()
  let who = mentions ? conn.parseMention(mentions) : []
  let part = who.length ? who : [m.sender]

  let act = false
  let eventName = event.toLowerCase()

  switch (eventName) {
    case 'stock':
    case 'pagos':
    case 'reglas':
      act = eventName
      break
    default:
      throw '╰⊱❗️⊱ *ACCIÓN MAL USADA* ⊱❗️⊱╮\n\nUsa: stock, pagos o reglas.'
  }

  let chatData = global.db.data.chats[m.chat] || {}
  let saved = chatData[eventName]

  if (!saved || !saved.content) {
    let fallback = `╰⊱❌⊱ *ERROR* ⊱❌⊱╮

NO TIENES NINGÚN MENSAJE CONFIGURADO

USA *.set${eventName}* PARA CONFIGURAR`
    return conn.reply(m.chat, fallback, m)
  }

  // Enviar imagen si está configurada
  if (saved.type === 'image') {
    try {
      let buffer = Buffer.from(saved.content, 'base64')
      await conn.sendFile(m.chat, buffer, `${eventName}.jpg`, `AQUI TIENES TU IMAGEN DE *${eventName.toUpperCase()}*`, m)
    } catch (e) {
      return conn.reply(m.chat, `❌ Error al enviar la imagen configurada para *${eventName}*.`, m)
    }
  }

  // Enviar texto si está configurado
  if (saved.type === 'text') {
    await conn.reply(m.chat, saved.content, m)
  }

  // Simular acción (opcional, si quieres que se haga algo con los usuarios)
  return conn.participantsUpdate({
    id: m.chat,
    participants: part,
    action: act
  })
}

handler.help = ['ver <evento> [@mención]', 'mostrar <evento>']
handler.tags = ['owner']
handler.command = /^ver|mostrar$/i
handler.group = true

export default handler
