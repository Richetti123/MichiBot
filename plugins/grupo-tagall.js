let handler = async (m, { conn, text, participants, args, command }) => {
  if (command == 'tagall' || command == 'invocar' || command == 'todos' || command == 'invocación' || command == 'invocacion') {
    let mensaje = args.join` `;
    let encabezado = `@richetti_123 ${mensaje}`;
    let texto = `${global.packname} te invoca despiértate 😡!!\n\n${encabezado}\n\n`;

    for (let mem of participants) {
      texto += `😼 @${mem.id.split('@')[0]}\n`;
    }
    texto += `${global.packname}`;
    conn.sendMessage(m.chat, { text: texto, mentions: participants.map(a => a.id) });
  }

  if (command == 'contador') {
    let memberData = participants.map(mem => {
      let userId = mem.id;
      let userData = global.db.data.users[userId] || {};
      let msgCount = userData.mensaje && userData.mensaje[m.chat] ? userData.mensaje[m.chat] : 0;
      return { id: userId, messages: msgCount };
    });

    memberData.sort((a, b) => b.messages - a.messages);
    let activeCount = memberData.filter(mem => mem.messages > 0).length;
    let inactiveCount = memberData.filter(mem => mem.messages === 0).length;

    let texto = `${global.packname} te invoca despiértate 😡!!\n\n*📊 Actividad del grupo 📊*\n\n`;
    texto += `Grupo: ${await conn.getName(m.chat)}\n`;
    texto += `Total de miembros: ${participants.length}\n`;
    texto += `Miembros activos: ${activeCount}\n`;
    texto += `Miembros inactivos: ${inactiveCount}\n\n`;
    texto += `Lista de miembros:\n`;

    for (let mem of memberData) {
      texto += `🤖 @${mem.id.split('@')[0]} - Mensajes: ${mem.messages}\n`;
    }

    conn.sendMessage(m.chat, { text: texto, mentions: memberData.map(a => a.id) }, { quoted: m });
  }
};

handler.command = /^(tagall|invocar|invocacion|todos|invocación|contador)$/i;
handler.group = true;
export default handler;
