import fetch from 'node-fetch'
var handler = async (m, { text,  usedPrefix, command }) => {
if (!text) throw `Soy ${global.packname} y estoy aqui para ayudarte escribeme tu peticion con .bot`
try {
conn.sendPresenceUpdate('composing', m.chat);
var apii = await fetch(`https://apis-starlights-team.koyeb.app/starlight/gemini?text=${text}`)
var res = await apii.json()
await m.reply(res.result)
} catch (e) {
await conn.reply(m.chat, `${lenguajeGB['smsMalError3']()}#report ${lenguajeGB['smsMensError2']()} ${usedPrefix + command}\n\n${wm}`, fkontak, m)
console.log(`❗❗ ${lenguajeGB['smsMensError2']()} ${usedPrefix + command} ❗❗`)
console.log(e)
}}
handler.command = ['bot', 'gemini']
handler.help = ['bard', 'gemini']
handler.tags = ['herramientas']

handler.premium = false

export default handler
