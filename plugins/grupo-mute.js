import fetch from 'node-fetch';

const handler = async (m, { conn, command, text }) => {
  let userToMute =
    m.mentionedJid?.[0] ||
    m.quoted?.sender ||
    text;

  if (!userToMute) {
    return conn.reply(m.chat, command === 'mute'
      ? '╰⊱❗️⊱ *Menciona a la persona que deseas mutar* ⊱❗️⊱'
      : '╰⊱❗️⊱ *Menciona a la persona que deseas demutar* ⊱❗️⊱╮', m);
  }

  const botNumber = conn.user.jid;
  const groupMetadata = await conn.groupMetadata(m.chat);
  const groupOwner = groupMetadata.owner || groupMetadata.id.split('-')[0] + '@s.whatsapp.net';

  if (userToMute === groupOwner)
    throw '❌️ *No puedes mutar el creador del grupo*';

  if (userToMute === botNumber)
    throw '❌️ *No puedes mutar el bot*';

  if (userToMute === global.owner[0][0] + '@s.whatsapp.net')
    throw '😼 *El creador del bot no puede ser mutado*';

  const userData = global.db.data.users[userToMute];

  if (command === 'mute') {
    if (userData.muto === true) throw '😼 *Este usuario ya ha sido mutado*';

    const fakeContact = {
      key: {
        participants: '0@s.whatsapp.net',
        fromMe: false,
        id: 'Halo'
      },
      message: {
        locationMessage: {
          name: '𝗨𝘀𝘂𝗮𝗿𝗶𝗼 mutado',
          jpegThumbnail: await (await fetch('https://telegra.ph/file/f8324d9798fa2ed2317bc.png')).buffer(),
          vcard: 'BEGIN:VCARD\nVERSION:3.0\nN:;Unlimited;;;\nFN:Unlimited\nORG:Unlimited\nTITLE:\nitem1.TEL;waid=19709001746:+1 (970) 900-1746\nitem1.X-ABLabel:Unlimited\nX-WA-BIZ-DESCRIPTION:ofc\nX-WA-BIZ-NAME:Unlimited\nEND:VCARD'
        }
      },
      participant: '0@s.whatsapp.net'
    };

    userData.muto = true;
    conn.reply(m.chat, '*Tus mensajes serán eliminados*', fakeContact, null, { mentions: [userToMute] });
  }

  if (command === 'unmute') {
    if (userData.muto === false) throw '😼 *Este usuario no ha sido mutado*';

    const fakeContact = {
      key: {
        participants: '0@s.whatsapp.net',
        fromMe: false,
        id: 'Halo'
      },
      message: {
        locationMessage: {
          name: '𝗨𝘀𝘂𝗮𝗿𝗶𝗼 demutado',
          jpegThumbnail: await (await fetch('https://telegra.ph/file/aea704d0b242b8c41bf15.png')).buffer(),
          vcard: 'BEGIN:VCARD\nVERSION:3.0\nN:;Unlimited;;;\nFN:Unlimited\nORG:Unlimited\nTITLE:\nitem1.TEL;waid=19709001746:+1 (970) 900-1746\nitem1.X-ABLabel:Unlimited\nX-WA-BIZ-DESCRIPTION:ofc\nX-WA-BIZ-NAME:Unlimited\nEND:VCARD'
        }
      },
      participant: '0@s.whatsapp.net'
    };

    userData.muto = false;
    conn.reply(m.chat, '*Tus mensajes no serán eliminados*', fakeContact, null, { mentions: [userToMute] });
  }
};

handler.command = /^(mute|unmute)$/i;
handler.group = true
handler.admin = true;

export default handler;
