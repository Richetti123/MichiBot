let handler = async (m, { conn, text, isROwner, isOwner }) => {
if (text) {
global.db.data.chats[m.chat].sStock = text
conn.reply(m.chat, `*TU METODO DE PAGO HA SIDO CONFIGURADO CORRECTAMENTE*`, fkontak, m)
} else throw `*PARA CONFIGURAR TU METODO DE PAGO EN ESTE GRUPO USA .setstock*`
}
handler.command = ['setstock'] 
handler.botAdmin = true
handler.admin = true
handler.group = true
export default handler
