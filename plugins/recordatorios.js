import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Para obtener __dirname en ES modules:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OWNER_NUMBER = '+5217771303481'; // Cambia por tu número con código país
const pagosFile = path.join(__dirname, 'src', 'pagos.json');

function cargarPagos() {
  if (!fs.existsSync(pagosFile)) return {};
  return JSON.parse(fs.readFileSync(pagosFile, 'utf8'));
}

function guardarPagos(pagos) {
  fs.writeFileSync(pagosFile, JSON.stringify(pagos, null, 2));
}

async function enviarMensaje(client, numero, mensaje) {
  await client.sendMessage(numero, { text: mensaje });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function verificarPagos(client) {
  const pagos = cargarPagos();
  const hoy = new Date().getDate();
  const manana = (new Date(Date.now() + 86400000)).getDate();

  const deudoresHoyManana = Object.entries(pagos)
    .filter(([_, pago]) => pago.diaPago === hoy || pago.diaPago === manana);

  if (deudoresHoyManana.length === 0) return;

  const listaPorDia = { [hoy]: [], [manana]: [] };
  deudoresHoyManana.forEach(([_, pago]) => {
    if (pago.diaPago === hoy) listaPorDia[hoy].push(pago);
    else listaPorDia[manana].push(pago);
  });

  let mensajeOwner = '';
  if (listaPorDia[hoy].length > 0) {
    mensajeOwner += `📅 *Pagos para hoy (${hoy}):*\n`;
    listaPorDia[hoy].forEach(p => {
      mensajeOwner += `- ${p.nombre}: ${p.monto} ${p.bandera}\n`;
    });
  }
  if (listaPorDia[manana].length > 0) {
    if (mensajeOwner) mensajeOwner += '\n';
    mensajeOwner += `📅 *Pagos para mañana (${manana}):*\n`;
    listaPorDia[manana].forEach(p => {
      mensajeOwner += `- ${p.nombre}: ${p.monto} ${p.bandera}\n`;
    });
  }

  await enviarMensaje(client, OWNE
