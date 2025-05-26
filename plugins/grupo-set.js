// Nuevo handler para visualizar cualquier configuración con un comando personalizado (ej: .pagos jair, .stock general, etc.)

let setHandler = async (m, { conn, args, command }) => {
  if (args.length < 2 && !m.quoted) {
    throw `╰⊱❗️⊱ *USO INCORRECTO* ⊱❗️⊱╮\n\n*Escribe lo que quieras configurar*\n*Ejemplo:\n.set pagos jair\n.set combos general`;
  }

  const [typeRaw, nameRaw, ...rest] = args;
  const type = typeRaw?.toLowerCase();
  const name = nameRaw?.toLowerCase();
  const value = rest.join(' ').trim();

  let chat = global.db.data.chats[m.chat] ||= {};
  chat.configs ||= {};
  chat.configs[type] ||= {};

  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';

  if (mime.startsWith('image')) {
    let buffer = await q.download();
    if (!buffer) throw '╰⊱❌⊱ *ERROR* ⊱❌⊱╮\n\n*No se pudo descargar la imagen.*';

    let base64 = buffer.toString('base64');
    chat.configs[type][name] = { type: 'image', content: base64 };

    return conn.reply(m.chat, `╰⊱💚⊱ *ÉXITO* ⊱💚⊱╮\n\n✅ *Imagen de ${type.toUpperCase()} (${name}) configurada correctamente.*`, m);
  }

  if (value) {
    chat.configs[type][name] = { type: 'text', content: value };
    return conn.reply(m.chat, `╰⊱💚⊱ *ÉXITO* ⊱💚⊱╮\n\n✅ *Texto de ${type.toUpperCase()} (${name}) configurado correctamente.*`, m);
  }

  throw `╰⊱❗️⊱ *USO INCORRECTO* ⊱❗️⊱╮\n\n *Envía un texto o responde a una imagen para configurar ${type.toUpperCase()} con el nombre "${name}".*`;
};

let viewHandler = async (m, { conn, command, args }) => {
  let configType = command.toLowerCase();
  let configName = args[0]?.toLowerCase();

  if (!configName) {
    return m.reply(`╰⊱❗️⊱ *USO INCORRECTO* ⊱❗️⊱╮\n\n *Debes especificar un nombre de configuración.*\n\n*✉ Ejemplo: .${configType} general*\n*.${configType} jair*`);
  }

  let chatData = global.db.data.chats[m.chat] ||= {};
  let allConfigs = chatData.configs ||= {};
  let configsOfType = allConfigs[configType] ||= {};
  let entry = configsOfType[configName];

  if (!entry || !entry.content) {
    return m.reply(`╰⊱❌⊱ *ERROR* ⊱❌⊱╮\n\n*No hay configuración guardada para ${configType.toUpperCase()} bajo el nombre "${configName}".*`);
  }

  if (entry.type === 'image') {
    try {
      let buffer = Buffer.from(entry.content, 'base64');
      return await conn.sendFile(
        m.chat,
        buffer,
        `${configType}-${configName}.jpg`,
        `📌 *${configType.toUpperCase()} - ${configName}*`,
        m
      );
    } catch (e) {
      return m.reply(`❌ Error al enviar la imagen de ${configType} (${configName}).`);
    }
  }

  if (entry.type === 'text') {
    return m.reply(entry.content);
  }
};

let unsetHandler = async (m, { conn, args }) => {
  if (args.length < 2) {
    throw `╰⊱⚠️⊱ *USO INCORRECTO* ⊱⚠️⊱╮\n\n*Ejemplo:*\n.unset pagos jair\n.unset stock general`;
  }

  const [typeRaw, nameRaw] = args;
  const type = typeRaw.toLowerCase();
  const name = nameRaw.toLowerCase();

  let chat = global.db.data.chats[m.chat] ||= {};
  let configs = chat.configs ||= {};
  let configsOfType = configs[type] ||= {};

  if (!configsOfType[name]) {
    return m.reply(`╰⊱❗️⊱ *USO INCORRECTO* ⊱❗️⊱╮\n\n❌ No se encontró configuración para *${type.toUpperCase()} (${name})*.`);
  }

  delete configsOfType[name];
  return m.reply(`╰⊱💚⊱ *ÉXITO* ⊱💚⊱╮\n\n*Configuración de ${type.toUpperCase()} (${name}) eliminada correctamente.*`);
};

setHandler.command = /^set$/i;
setHandler.group = true;
setHandler.admin = true;
setHandler.botAdmin = true;

unsetHandler.command = /^unset$/i;
unsetHandler.group = true;
unsetHandler.admin = true;
unsetHandler.botAdmin = true;

const customCommands = ['pagos', 'stock', 'combos', 'reglas', 'ofertas'];
for (let name of customCommands) {
  let h = Object.assign({}, viewHandler);
  h.command = new RegExp(`^${name}$`, 'i');
  h.help = [`${name} <nombre>`];
  h.tags = ['tools'];
  h.group = true;
  module.exports[`${name}Handler`] = h;
}

module.exports.setHandler = setHandler;
module.exports.unsetHandler = unsetHandler;

export default setHandler;
