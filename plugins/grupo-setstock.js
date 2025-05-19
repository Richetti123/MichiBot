let handler = async (m, { conn, text, isROwner, isOwner }) => {
if (text) {
global.db.data.chats[m.chat].sStock = text
conn.reply(m.chat, `*EL STOCK DE TUS VENTAS HA SIDO CONFIGURADO CORRECTAMENTE*`, fkontak, m)
} else throw `*PARA CONFIGURAR TU STOCK DE VENTAS EN ESTE GRUPO USA .setstock*`
}
handler.command = ['setstock'] 
handler.botAdmin = true
handler.admin = true
handler.group = true
export default handler
