// plugins/recordatorio.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; // <-- CORRECCIÓN 1: Importación necesaria para __dirname

// <-- CORRECCIÓN 1: Definición de __dirname para módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let handler = async (m, { conn, text, command, usedPrefix }) => {
    // Definimos la ruta del archivo de pagos.
    // <-- CORRECCIÓN 2: Ruta ajustada para subir solo un nivel
    const paymentsFilePath = path.join(__dirname, '..', 'src', 'pagos.json');

    // El nombre del cliente será el texto después del comando.
    const clientNameInput = text.trim();

    if (!clientNameInput) {
        return m.reply(`*Uso incorrecto del comando:*\nPor favor, proporciona el nombre del cliente.\nEjemplo: \`\`\`${usedPrefix}${command} Victoria\`\`\``);
    }

    try {
        const clientsData = JSON.parse(fs.readFileSync(paymentsFilePath, 'utf8'));
        let clientFound = false;
        let foundClientInfo = null;
        let foundPhoneNumberKey = null; // <-- CORRECCIÓN 3: Variable para guardar la clave del número

        for (const phoneNumberKey in clientsData) {
            const clientInfo = clientsData[phoneNumberKey];
            if (clientInfo.nombre && clientInfo.nombre.toLowerCase() === clientNameInput.toLowerCase()) {
                clientFound = true;
                foundClientInfo = clientInfo;
                foundPhoneNumberKey = phoneNumberKey; // <-- CORRECCIÓN 3: Guardamos la clave (que es el número)
                break;
            }
        }

        // <-- CORRECCIÓN 3: Aseguramos que tengamos la clave del número
        if (clientFound && foundClientInfo && foundPhoneNumberKey) {
            // <-- CORRECCIÓN 3: Obtenemos 'numero' de la clave, no de foundClientInfo
            const { monto, bandera, nombre } = foundClientInfo;
            const numero = foundPhoneNumberKey; // El
