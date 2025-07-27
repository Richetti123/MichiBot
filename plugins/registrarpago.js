// plugins/registrarpago.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; // <-- AÑADE ESTA IMPORTACIÓN

// Define __dirname para módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // <-- AÑADE ESTAS DOS LÍNEAS

let handler = async (m, { conn, text, command, usedPrefix }) => {
    // Definimos la ruta del archivo de pagos.
    // Ahora, __dirname funcionará correctamente
    const paymentsFilePath = path.join(__dirname, '..', '..', 'src', 'pagos.json');

    // Parseamos los argumentos del comando.
    const args = text.split(' ').map(arg => arg.trim());

    if (args.length < 5) {
        return m.reply(`*Uso incorrecto del comando:*\nPor favor, proporciona el nombre, número, día de pago, monto y bandera.\nEjemplo: \`\`\`${usedPrefix}${command} Marcelo +569292929292 21 $3000 🇨🇱\`\`\`\n\n*Nota:* El día de pago debe ser un número (1-31).`);
    }

    const clientName = args[0];
    const clientNumber = args[1];
    const diaPago = parseInt(args[2]);
    const monto = args[3];
    const bandera = args[4];

    if (!clientNumber.startsWith('+') || clientNumber.length < 5) {
        return m.reply(`*Número de teléfono inválido:*\nPor favor, asegúrate de que el número comience con '+' y sea un formato válido.\nEjemplo: \`\`\`+569292929292\`\`\``);
    }
    if (isNaN(diaPago) || diaPago < 1 || diaPago > 31) {
        return m.reply(`*Día de pago inválido:*\nEl día de pago debe ser un número entre 1 y 31.\nEjemplo: \`\`\`${usedPrefix}${command} Victoria +569292929292 *21* $3000 🇨🇱\`\`\``);
    }

    try {
        let clientsData = {};
        if (fs.existsSync(paymentsFilePath)) {
            clientsData = JSON.parse(fs.readFileSync(paymentsFilePath, 'utf8'));
        }

        if (clientsData[clientNumber]) {
            return m.reply(`❌ El cliente con el número \`\`\`${clientNumber}\`\`\` ya existe en la base de datos.`);
        }

        clientsData[clientNumber] = {
            nombre: clientName,
            diaPago: diaPago,
            monto: monto,
            bandera: bandera
        };

        fs.writeFileSync(paymentsFilePath, JSON.stringify(clientsData, null, 2), 'utf8');

        m.reply(`✅ Cliente *${clientName}* (${clientNumber}) añadido exitosamente a la base de datos de pagos.`);

    } catch (e) {
        console.error('Error al procesar el comando .registrarpago:', e);
        m.reply(`❌ Ocurrió un error interno al intentar añadir el cliente. Por favor, reporta este error.`);
    }
};

handler.help = ['registrarpago <nombre> <numero> <diaPago> <monto> <bandera>'];
handler.tags = ['pagos'];
handler.command = /^(registrarpago|agregarcliente)$/i;
handler.group = true;
handler.admin = true;

export default handler;
