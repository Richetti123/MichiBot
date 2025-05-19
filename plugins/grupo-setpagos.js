let handler = async (m, { conn, text, isROwner, isOwner }) => {
if (text) {
global.db.data.chats[m.chat].sPagos = text
conn.reply(m.chat, lenguajeGB.smsSetP(), fkontak, m)
} else throw `${lenguajeGB['smsSetP2']()}`
}
handler.command = ['setpagos'] 
handler.botAdmin = true
handler.admin = true
handler.group = true
export default handler
