let handler = async (m, { conn, usedPrefix, command, args: [event], text }) => {
  if (!event) {
    return await m.reply(`${mid.smsMalused7}

${usedPrefix + command} stock @user
${usedPrefix + command} pagos @user
${usedPrefix + command} reglas @user`)
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
      throw '❌ Opción inválida. Usa: stock, pagos o reglas.'
  }

  let chatData = global.db.data.chats[m.chat] || {}
  let content = chatData[eventName]

  if (!content || content.trim() === '') {
    content = `╰⊱❌⊱ *ERROR* ⊱❌⊱╮

NO TIENES NINGÚN MENSAJE CONFIGURADO

PARA HACERLO ESCRIBE *.set${eventName}*`
  }

  conn.reply(m.chat, content, fkontak, m)

  return conn.participantsUpdate({
    id: m.chat,
    participants: part,
    action: act
  })
}

handler.help = ['simulate <event> [@mention]', 'simular <event>'] 
handler.tags = ['owner']
handler.command = /^enseñar|mostrar$/i
handler.group = true

export default handler
