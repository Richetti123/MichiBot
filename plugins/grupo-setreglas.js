let handler = async (m, { conn, text, isROwner, isOwner }) => {
if (text) {
global.db.data.chats[m.chat].reglas = text
conn.reply(m.chat, `╰⊱💚⊱ *ÉXITO* ⊱💚⊱╮\n\n*TUS REGLAS HAN SIDO CONFIGURADAS CORRECTAMENTE*`, fkontak, m)
} else throw `*PARA CONFIGURAR TUS REGLAS EN ESTE GRUPO USA .setreglas*`
}
handler.command = ['setreglas'] 
handler.botAdmin = true
handler.admin = true
handler.group = true
export default handler
