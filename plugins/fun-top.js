import util from 'util';
import path from 'path';

function handler(m, { groupMetadata, command, conn, text, usedPrefix }) {
    if (!text) {
        throw `Ejemplo de uso:\n${usedPrefix}top *texto*`;
    }

    const ps = groupMetadata.participants.map((v) => v.id);
    const a = ps.getRandom();
    const b = ps.getRandom();
    const c = ps.getRandom();
    const d = ps.getRandom();
    const e = ps.getRandom();
    const f = ps.getRandom();
    const g = ps.getRandom();
    const h = ps.getRandom();
    const i = ps.getRandom();
    const j = ps.getRandom();
    const k = Math.floor(Math.random() * 70);
    const x = `${pickRandom(['🤓', '😅', '😂', '😳', '😎', '🥵', '😱', '🤑', '🙄', '💩', '🍑', '🤨', '🥴', '🔥', '👇🏻', '😔', '👀', '🌚'])}`;
    const l = Math.floor(Math.random() * x.length);
    const vn = `https://hansxd.nasihosting.com/sound/sound${k}.mp3`;
    const top = `*${x} Top 10 ${text} ${x}*
   
*1. ${conn.getName(a)}*
*2. ${conn.getName(b)}*
*3. ${conn.getName(c)}*
*4. ${conn.getName(d)}*
*5. ${conn.getName(e)}*
*6. ${conn.getName(f)}*
*7. ${conn.getName(g)}*
*8. ${conn.getName(h)}*
*9. ${conn.getName(i)}*
*10. ${conn.getName(j)}*`;

    m.reply(top, null, { mentions: [a, b, c, d, e, f, g, h, i, j] });
}

handler.help = handler.command = ['top'];
handler.tags = ['fun'];
handler.group = true;
export default handler;

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}
