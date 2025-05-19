let handler = async (m, { conn, text, isROwner, isOwner }) => {
if (text) {
global.db.data.chats[m.chat].sReglas = text
conn.reply(m.chat, lenguajeGB.smsSetR(), fkontak, m)
} else throw `${lenguajeGB['smsSetR2']()}`
}
handler.command = ['setreglas'] 
handler.botAdmin = true
handler.admin = true
handler.group = true
export default handler
