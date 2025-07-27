import fs from 'fs';
import path from 'path';

let handler = async (m, { conn, text, command, usedPrefix }) => {
    // Definimos la ruta del archivo de pagos.
    // Necesitamos ir dos niveles arriba (../../) para llegar a la raíz del proyecto desde el plugin.
    const paymentsFilePath = path.join(__dirname, '..', '..', 'src', 'pagos.json');

    // El nombre del cliente será el texto que sigue al comando.
    const clientNameInput = text.trim();

    if (!clientNameInput) {
        return m.reply(`*Uso incorrecto del comando:*\nPor favor, proporciona el nombre del cliente.\nEjemplo: \`\`\`${usedPrefix}${command} Marcelo\`\`\``);
    }

    try {
        const clientsData = JSON.parse(fs.readFileSync(paymentsFilePath, 'utf8'));
        let clientFound = false;

        // Buscamos al cliente por su nombre (la clave en el JSON)
        if (clientsData[clientNameInput]) {
            clientFound = true;
            const clientInfo = clientsData[clientNameInput];
            const { numero, monto, bandera } = clientInfo;
            const targetNumberWhatsApp = numero.replace(/\+/g, '') + '@c.us';

            let reminderMessage = `¡Hola ${clientNameInput}! 👋 Este es un recordatorio de tu pago pendiente de ${monto}.`;
            let paymentDetails = '';

            // Lógica para añadir el método de pago según el país
            switch (bandera) {
                case '🇲🇽': // México
                    paymentDetails = `\n\nPara pagar en México, usa:
                    CLABE: 706969168872764411
                    Nombre: Gaston Juarez
                    Banco: Arcus Fi`;
                    break;
                case '🇵🇪': // Perú
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
                m.reply(`✅ Recordatorio enviado exitosamente a *${clientNameInput}* (${numero}).`);
            } catch (sendError) {
                console.error(`Error al enviar mensaje a ${clientNameInput} (${numero}):`, sendError);
                m.reply(`❌ Falló el envío del recordatorio a *${clientNameInput}* (${numero}). Posiblemente el número no sea válido en WhatsApp.`);
            }
        }

        if (!clientFound) {
            m.reply(`❌ No se encontró ningún cliente con el nombre \`\`\`${clientNameInput}\`\`\` en la base de datos de pagos. Asegúrate de escribirlo exactamente como está en el JSON (ej. "Victoria").`);
        }

    } catch (e) {
        console.error('Error al procesar el comando .recordatorio:', e);
        m.reply(`❌ Ocurrió un error interno al intentar enviar el recordatorio. Por favor, reporta este error.`);
    }
};

handler.help = ['recordatorio <nombre_cliente>'];
handler.tags = ['pagos'];
handler.command = /^(recordatorio)$/i;

export default handler;
