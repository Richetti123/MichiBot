// lib/recordatorios.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// <--- NÚMERO DEL ADMINISTRADOR: Puedes mover esto a config.js si lo deseas --->
const ADMIN_NUMBER_CONFIRMATION = '5217771303481@c.us'; // Tu número sin el '+' y con '@c.us' al final
// <-------------------------------------------------------------------------->

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function sendAutomaticPaymentReminders(client) {
    const today = new Date();
    const currentDayOfMonth = today.getDate(); // Current day of the month

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Calculate tomorrow's date
    const tomorrowDayOfMonth = tomorrow.getDate(); // Tomorrow's day of the month

    try {
        const paymentsFilePath = path.join(__dirname, '..', 'src', 'pagos.json');

        let clientsData = {};
        if (fs.existsSync(paymentsFilePath)) {
            clientsData = JSON.parse(fs.readFileSync(paymentsFilePath, 'utf8'));
        } else {
            fs.writeFileSync(paymentsFilePath, JSON.stringify({}, null, 2), 'utf8');
        }

        for (const phoneNumberKey in clientsData) {
            const clientInfo = clientsData[phoneNumberKey];
            const numero = phoneNumberKey; // El número es la clave principal en pagos.json
            const { diaPago, monto, bandera, nombre } = clientInfo;

            let message = '';
            let shouldSend = false;

            if (diaPago === currentDayOfMonth) {
                message = `¡Hola ${nombre}! 👋 Es tu día de pago. Recuerda que tu monto es de ${monto}.`;
                shouldSend = true;
            } else if (diaPago === tomorrowDayOfMonth) {
                message = `¡Hola ${nombre}! 👋 Tu pago de ${monto} vence mañana. ¡No lo olvides!`;
                shouldSend = true;
            }

            if (shouldSend) {
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

                message += paymentDetails;

                const formattedNumber = numero.replace(/\+/g, '') + '@c.us';

                console.log(`Attempting to send automatic reminder to ${nombre} (${formattedNumber}): ${message}`);
                try {
                    await client.sendMessage(formattedNumber, { text: message });
                    console.log(`Automatic reminder sent successfully to ${nombre}.`);

                    // <-- NUEVA FUNCIONALIDAD: Notificar al administrador -->
                    const confirmationText = `✅ Recordatorio automático enviado a *${nombre}* (${numero}).`;
                    await client.sendMessage(ADMIN_NUMBER_CONFIRMATION, { text: confirmationText });
                    // <--------------------------------------------------->

                } catch (sendError) {
                    console.error(`Error sending automatic reminder to ${nombre} (${numero}):`, sendError);
                    // Opcional: También puedes notificar al admin si un recordatorio automático FALLA
                    // await client.sendMessage(ADMIN_NUMBER_CONFIRMATION, { text: `❌ Falló el recordatorio automático a *${nombre}* (${numero}). Error: ${sendError.message || sendError}` });
                }
            }
        }
    } catch (error) {
        console.error('Error sending automatic payment reminders:', error);
    }
}

export default sendAutomaticPaymentReminders;
