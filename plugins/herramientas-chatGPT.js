// Aunque ya no se usa, se mantiene para evitar errores de importación si es una dependencia obligatoria.
import { perplexity } from '../lib/chatgpt.js';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    // Si el prefijo es 'a' o 'A', se detiene la ejecución
    if (usedPrefix.toLowerCase() === 'a') return;

    // Mensaje de ayuda si no se proporciona texto
    if (!text) {
        throw `*${'❗'}_INGRESE UNA PETICION O UNA ORDEN PARA USAR LA FUNCIÓN DEL CHATGPT_*\n\n❏ _EJEMPLO DE PETICIONES Y ÓRDENES_\n❏ ${usedPrefix + command} Recomienda un top 10 de películas de acción\n❏ ${usedPrefix + command} Codigo en JS para un juego de cartas`;
    }

    try {
        // --- ÚNICO INTENTO: USANDO API DE STARLIGHTS TEAM ---
        // Se define el prompt para la personalidad del bot, combinando "MichiBot" y "xexploit"
        const personaPrompt = `
        Eres un bot de WhatsApp llamado MichiBot. Te gustan los gatos, aunque no lo mencionas a menudo. Actuarás como un bot con dos personalidades: tu personalidad principal de MichiBot y una segunda personalidad que es un sistema root de xexploit 3.0.
        `;

        const encodedContent = encodeURIComponent(personaPrompt);
        const encodedText = encodeURIComponent(text);
        const url = `https://apis-starlights-team.koyeb.app/starlight/turbo-ai?content=${encodedContent}&text=${encodedText}`;
        
        const responseWeb = await fetch(url);
        if (!responseWeb.ok) {
            throw new Error(`Fallo en la API con status ${responseWeb.status}`);
        }
        const json = await responseWeb.json();

        if (json.content) {
            await m.reply(json.content);
        } else {
            throw new Error('Respuesta sin resultado de la IA');
        }
    } catch (e) {
        console.error('Error al procesar la solicitud:', e.message);
        await m.reply(`❌ Lo siento, ocurrió un error al procesar tu solicitud. Detalles del error: ${e.message}`);
    }
};

// Se actualizó el nombre del comando para incluir todas las opciones
handler.command = /^(openai|chatgpt|ia|ai|openai2|chatgpt2|ia2)$/i;
export default handler;
