// plugins/recordatorio.js
import fs from 'fs';
import path from 'path';

let handler = async (m, { conn, text, command, usedPrefix }) => {
    // Path to your pagos.json file.
    const paymentsFilePath = path.join(__dirname, '..', '..', 'src', 'pagos.json');

    // The client's name will be the text after the command.
    const clientNameInput = text.trim();

    if (!clientNameInput) {
        return m.reply(`*Uso incorrecto del comando:*\nPor favor, proporciona el nombre del cliente.\nEjemplo: \`\`\`${usedPrefix}${command} Marcelo\`\`\``);
    }

    try {
        const clientsData = JSON.parse(fs.readFileSync(paymentsFilePath, 'utf8'));
        let clientFound = false;
        let foundClientInfo = null; // Para almacenar la información del cliente encontrado

        // Iterar sobre las claves (números de teléfono) del JSON
        for (const phoneNumberKey in clientsData) {
            const clientInfo = clientsData[phoneNumberKey];
            // Comparar el nombre ingresado con la propiedad 'nombre' de cada cliente
            if (clientInfo.nombre && clientInfo.nombre.toLowerCase() === clientNameInput.toLowerCase()) {
                clientFound = true;
                foundClientInfo = clientInfo;
                break; // Salir del bucle una vez que se encuentra el cliente
            }
        }

        if (clientFound && foundClientInfo) {
            const { numero, monto, bandera, nombre } = foundClientInfo; // Usamos 'nombre' del objeto encontrado
            const targetNumberWhatsApp = numero.replace(/\+/g, '') + '@c.us';

            let reminderMessage = `¡Hola ${nombre}! 👋 Este es un recordatorio de tu pago pendiente de ${monto}.`;
            let paymentDetails = '';

            // Lógica para añadir el método de pago según el país
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
        } else { // Si no se encontró el cliente después de iterar
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
