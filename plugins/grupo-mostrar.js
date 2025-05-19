let handler = async (m, { conn, usedPrefix, command, args: [event], text }) => {

let mentions = text.replace(event, '').trimStart()
let who = mentions ? conn.parseMention(mentions) : []
let part = who.length ? who : [m.sender]
let act = false

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
