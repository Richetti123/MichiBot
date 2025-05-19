let handler = async (m, { conn, usedPrefix, command, args: [event], text }) => {
if (!event) return await m.reply(`${mid.smsMalused7}

${usedPrefix + command} stock @user
${usedPrefix + command} pagos @user
${usedPrefix + command} reglas @user`) 
/*conn.sendButton(m.chat, `${mid.smsMalused7}

${usedPrefix + command} welcome @user
${usedPrefix + command} bye @user
${usedPrefix + command} promote @user
${usedPrefix + command} demote @user`.trim(), wm, null, [['WELCOME', '#simulate welcome'], ['BYE', '#simulate bye']])*/
let mentions = text.replace(event, '').trimStart()
let who = mentions ? conn.parseMention(mentions) : []
let part = who.length ? who : [m.sender]
let act = false
conn.reply(m.chat, (global.db.data.chats[m.chat].pagos), fkontak, m)
switch (event.toLowerCase()) {
case 'stock':
act = 'stock'
case 'pagos':
act = 'pagos'
case 'reglas':
act = 'reglas'
break
default:
throw 'error, ingrese una opcion valida'
}
if (act) return conn.participantsUpdate({
id: m.chat,
participants: part,
action: act
})}
handler.help = ['simulate <event> [@mention]','simular <event>'] 
handler.tags = ['owner']
handler.command = /^enseñar|mostrar$/i
handler.group = true
export default handler
