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

  switch (event.toLowerCase()) {
    case 'stock':
    case 'pagos':
    case 'reglas':
      act = event.toLowerCase()
      break
    default:
      throw 'Error, ingrese una opción válida: stock, pagos o reglas.'
  }

  let chatData = global.db.data.chats[m.chat] || {}
  let message = chatData[event.toLowerCase()] || 'NO TIENES NINGUN MENSAJE CONFIGURADO'

  conn.reply(m.chat, message, fkontak, m)

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
