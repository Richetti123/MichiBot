import FormData from "form-data";
import Jimp from "jimp";

const handler = async (m, {conn, usedPrefix, command}) => {
 try {  
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || q.mediaType || "";
  if (!mime) throw `╰⊱❗️⊱ *𝙇𝙊 𝙐𝙎𝙊́ 𝙈𝘼𝙇 | 𝙐𝙎𝙀𝘿 𝙄𝙏 𝙒𝙍𝙊𝙉𝙂* ⊱❗️⊱╮\n\n𝙀𝙉𝙑𝙄𝙀 𝙐𝙉𝘼 𝙄𝙈𝘼𝙂𝙀𝙉 𝙊 𝙍𝙀𝙎𝙋𝙊𝙉𝘿𝘼 𝘼 𝙐𝙉𝘼 𝙄𝙈𝘼𝙂𝙀𝙉 𝘾𝙊𝙉 𝙀𝙇 𝘾𝙊𝙈𝘼𝙉𝘿𝙊 ${usedPrefix + command}`;
  if (!/image\/(jpe?g|png)/.test(mime)) throw `╰⊱⚠️⊱ *𝘼𝘿𝙑𝙀𝙍𝙏𝙀𝙉𝘾𝙄𝘼 | 𝙒𝘼𝙍𝙉𝙄𝙉𝙂* ⊱⚠️⊱╮\n\nEL FORMATO DEL ARCHIVO (${mime}) NO ES COMPATIBLE, ENVÍA O RESPONDE A UNA FOTO`;
  m.reply("*🐈 𝙈𝙀𝙅𝙊𝙍𝘼𝙉𝘿𝙊 𝙇𝘼 𝘾𝘼𝙇𝙄𝘿𝘼𝘿...*");
  let img = await q.download?.();
  let pr = await remini(img, "enhance");
  conn.sendMessage(m.chat, {image: pr}, {quoted: m});
 } catch (e) {
  // Manejamos el error específico de la función remini aquí
  console.error(e);
  throw "╰⊱⚠️⊱ *𝘼𝘿𝙑𝙀𝙍𝙏𝙀𝙉𝘾𝙄𝘼 | 𝙒𝘼𝙍𝙉𝙄𝙉𝙂* ⊱⚠️⊱╮\n\n𝙁𝘼𝙇𝙇𝙊, 𝙋𝙊𝙍 𝙁𝘼𝙑𝙊𝙍 𝙑𝙐𝙀𝙇𝙑𝘼 𝘼 𝙄𝙉𝙏𝙀𝙉𝙏𝘼𝙍";
 }
};

handler.help = ["remini", "hd", "enhance"];
handler.tags = ["ai", "tools"];
handler.command = ["remini", "hd", "enhance"];
export default handler;

/**
 * Mejora la calidad de una imagen utilizando la API de Vyro.ai.
 * @param {Buffer} imageData El búfer de la imagen.
 * @param {string} operation La operación a realizar ("enhance", "recolor", "dehaze").
 * @returns {Promise<Buffer>} Promesa que resuelve con el búfer de la imagen mejorada.
 */
async function remini(imageData, operation) {
  return new Promise(async (resolve, reject) => {
    const availableOperations = ["enhance", "recolor", "dehaze"];
    if (availableOperations.includes(operation)) {
      operation = operation;
    } else {
      operation = availableOperations[0];
    }
    const baseUrl = "https://inferenceengine.vyro.ai/" + operation + ".vyro";
    const formData = new FormData();
    formData.append("image", Buffer.from(imageData), {filename: "enhance_image_body.jpg", contentType: "image/jpeg"});
    formData.append("model_version", 1, {"Content-Transfer-Encoding": "binary", contentType: "multipart/form-data; charset=utf-8"});
    
    // El método `submit` de `form-data` necesita la URL completa y los encabezados.
    // Usamos el objeto de opciones para una mejor claridad.
    const options = {
      url: baseUrl,
      host: "inferenceengine.vyro.ai",
      path: "/" + operation,
      protocol: "https:",
      headers: {
        "User-Agent": "okhttp/4.9.3",
        "Connection": "Keep-Alive",
        "Accept-Encoding": "gzip"
      }
    };
    
    // Se usa el callback para manejar la respuesta
    formData.submit(options, function (err, res) {
      if (err) {
        // Si hay un error, lo rechazamos y salimos de la función.
        return reject(err);
      }
      
      // AQUI ES LA CORRECCION PRINCIPAL
      // Verificamos si el objeto de respuesta (res) es undefined antes de usarlo.
      // Esto previene el error 'TypeError: Cannot read properties of undefined (reading 'on')'.
      if (!res) {
        return reject(new Error("Response object is undefined. The request failed."));
      }
      
      const chunks = [];
      res.on("data", function (chunk) {chunks.push(chunk)});
      res.on("end", function () {resolve(Buffer.concat(chunks))});
      res.on("error", function (err) {
        reject(err);
      });
    });
  });
}
