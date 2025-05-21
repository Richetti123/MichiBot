let handler = async (m, { conn, usedPrefix, command, args, text }) => {
  const [eventNameRaw, userMention] = args
  const eventName = eventNameRaw ? eventNameRaw.toLowerCase() : null

  const validEvents = ['pagos', 'stock', 'reglas']
  if (!eventName || !validEvents.includes(eventName)) {
    return m.reply(`╰⊱❌⊱ *USO INCORRECTO* ⊱❌⊱╮

Ejemplos:
${usedPrefix + command} pagos @${m.sender.split`@`[0]}
${usedPrefix + command} stock @${m.sender.split`@`[0]}
${usedPrefix + command} reglas @${m.sender.split`@`[0]}`, false, {mentions: [m.sender]})
  }

  let userId = userMention
    ? userMention.replace(/[@+]/g, '').split('@')[0]
    : m.sender.split('@')[0]

  let chatData = global.db.data.chats[m.chat] || {}
  let dataByType = chatData[eventName] || {}
  let entry = dataByType[userId]

  if (!entry || !entry.content) {
    return conn.reply(m.chat, `╰⊱❌⊱ *NO CONFIGURADO* ⊱❌⊱╮\n\nNo se encontró ${eventName.toUpperCase()} configurado para *@${userId}*.`, false, {mentions: [m.sender]}, m)
  }

  if (entry.type === 'image') {
    try {
      let buffer = Buffer.from(entry.content, 'base64')
      await conn.sendFile(
        m.chat,
        buffer,
        `${eventName}-${userId}.jpg`,
        `📌 *${eventName.toUpperCase()} de ${userId}*`,
        m
      )
    } catch {
      return conn.reply(m.chat, `╰⊱❌⊱ *ERROR* ⊱❌⊱╮\n\nError al enviar la imagen configurada para *@${userId}*.`, false, {mentions: [m.sender]}, m)
    }
  }

  if (entry.type === 'text') {
    return conn.reply(m.chat, entry.content, m)
  }
}

handler.help = ['ver <evento> [@usuario]', 'mostrar <evento>']
handler.tags = ['owner']
handler.command = /^ver|mostrar$/i
handler.group = true

export default handler
