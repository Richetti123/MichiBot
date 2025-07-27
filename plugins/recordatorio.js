// plugins/recordatorio.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let handler = async (m, { conn, text, command, usedPrefix }) => {
    const paymentsFilePath = path.join(__dirname, '..', 'src', 'pagos.json');
    const clientNameInput = text.trim();

    if (!clientNameInput) {
        return m.reply(`*Uso incorrecto del comando:*\nPor favor, proporciona el nombre del cliente.\nEjemplo: \`\`\`${usedPrefix}${command} Victoria\`\`\``);
    }

    try {
        const clientsData = JSON.parse(fs.readFileSync(paymentsFilePath, 'utf8'));
        let clientFound = false;
        let foundClientInfo = null;
        let foundPhoneNumberKey = null; // <-- Añadimos una variable para guardar la clave del número

        for (const phoneNumberKey in clientsData) {
            const clientInfo = clientsData[phoneNumberKey];
            if (clientInfo.nombre && clientInfo.nombre.toLowerCase() === clientNameInput.toLowerCase()) {
                clientFound = true;
                foundClientInfo = clientInfo;
                foundPhoneNumberKey = phoneNumberKey; // <-- Guardamos la clave (el número)
                break;
            }
        }

        if (clientFound && foundClientInfo && foundPhoneNumberKey) { // <-- Aseguramos que tengamos la clave
            const { monto, bandera, nombre } = foundClientInfo;
            const numero = foundPhoneNumberKey; // <-- ¡Usamos la clave como el número!

            const targetNumberWhatsApp = numero.replace(/\+/g, '') + '@c.us'; // Ahora 'numero' no será undefined

            let reminderMessage = `¡Hola ${nombre}! 👋 Este es un recordatorio de tu pago pendiente de ${monto}.`;
            let paymentDetails = '';

            switch (bandera) {
                case '🇲🇽': // Mexico
                    paymentDetails = `\n\nPara pagar en México, usa:
                    CLABE: 706969168872764411
                    Nombre: Gaston Juarez
                    Banco: Arcus Fi`;
                    break;
                case '🇵🇪': // Peru
                    paymentDetails = `\n\nPara pagar en Perú, usa:
                    Nombre: Marcelo Gonzales R.
                    Yape: 967699188
                    Plin: 955095498`;
                    break;
                case '🇨🇱': // Chile
                    paymentDetails = `\n\nPara pagar en Chile, usa:
                    Nombre: BARINIA VALESKA ZENTENO MERINO
                    RUT: 17053067-5
                    BANCO ELEGIR: TEMPO
                    Tipo de cuenta: Cuenta Vista
                    Numero de cuenta: 111117053067
                    Correo: estraxer2002@gmail.com`;
                    break;
                case '🇦🇷': // Argentina
                    paymentDetails = `\n\nPara pagar en Argentina, usa:
                    Nombre: Gaston Juarez
                    CBU: 4530000800011127480736`;
                    break;
                default:
                    paymentDetails = '\n\nPor favor, contacta para coordinar tu pago. No se encontraron métodos de pago específicos para tu país.';
            }

            reminderMessage += paymentDetails;

            try {
                await conn.sendMessage(targetNumberWhatsApp, reminderMessage);
                m.reply(`✅ Recordatorio enviado exitosamente a *${nombre}* (${numero}).`);
            } catch (sendError) {
                console.error(`Error sending message to ${nombre} (${numero}):`, sendError);
                m.reply(`❌ Failed to send reminder to *${nombre}* (${numero}). Possibly the number is not valid on WhatsApp.`);
            }
        } else {
            m.reply(`❌ No se encontró ningún cliente con el nombre \`\`\`${clientNameInput}\`\`\` en la base de datos de pagos. Asegúrate de escribirlo correctamente.`);
        }

    } catch (e) {
        console.error('Error processing .recordatorio command:', e);
        m.reply(`❌ Ocurrió un error interno al intentar enviar el recordatorio. Por favor, reporta este error.`);
    }
};

handler.help = ['recordatorio <nombre_cliente>'];
handler.tags = ['pagos'];
handler.command = /^(recordatorio)$/i;
handler.group = true;
handler.admin = true;

export default handler;
