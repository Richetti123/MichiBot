let handler = async (m, { conn, text, isROwner, isOwner }) => {
if (text) {
global.db.data.chats[m.chat].sStock = text
conn.reply(m.chat, lenguajeGB.smsSetS(), fkontak, m)
} else throw `${lenguajeGB['smsSetS2']()}`
}
handler.command = ['setstock'] 
handler.botAdmin = true
handler.admin = true
handler.group = true
export default handler
