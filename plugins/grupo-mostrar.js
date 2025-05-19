let handler = async (m, { conn, usedPrefix, command, args: [event], text }) => {
  if (!event) {
    return await m.reply(`${mid.smsMalused7}

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

PARA HACERLO ESCRIBE *.set${eventName}*`
    return conn.reply(m.chat, fallback, fkontak, m)
  }

  // Enviar según el tipo de contenido
  if (saved.type === 'image') {
    try {
      let buffer = Buffer.from(saved.content, 'base64')
      await conn.sendFile(m.chat, buffer, `${eventName}.jpg`, '', m, false, { quoted: fkontak })
    } catch (e) {
      return conn.reply(m.chat, `❌ Error al enviar la imagen configurada para *${eventName}*.`, m)
    }
  } else {
    await conn.reply(m.chat, saved.content, fkontak, m)
  }

  // Acción simulada (stock, pagos, reglas)
  return conn.participantsUpdate({
    id: m.chat,
    participants: part,
    action: act
  })
}

handler.help = ['simulate <event> [@mention]', 'simular <event>']
handler.tags = ['owner']
handler.command = /^ver|mostrar$/i
handler.group = true

export default handler
