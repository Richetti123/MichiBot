import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pagosFile = path.join(__dirname, '..', 'src', 'pagos.json');
const OWNER_NUMBER = '+5217771303481';

function cargarPagos() {
  if (!fs.existsSync(pagosFile)) return {};
  try {
    return JSON.parse(fs.readFileSync(pagosFile, 'utf8'));
  } catch {
    return {};
  }
}

async function enviarMensaje(conn, numero, mensaje) {
  await conn.sendMessage(numero, { text: mensaje });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function verificarPagos(conn) {
  const pagos = cargarPagos();
  const hoy = new Date().getDate();
  const manana = new Date(Date.now() + 86400000).getDate();

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

  await enviarMensaje(conn, OWNER_NUMBER, mensajeOwner);

  const deudoresHoy = deudoresHoyManana.filter(([_, pago]) => pago.diaPago === hoy);
  for (let i = 0; i < deudoresHoy.length; i++) {
    const [numero, pago] = deudoresHoy[i];
    const mensajeUsuario = `💸 *Recordatorio de pago*\nHola *${pago.nombre}*, recordá que el *${pago.diaPago}* de cada mes tenés que abonar *${pago.monto} ${pago.bandera}*.\n¡Por favor, realizá tu pago a tiempo!`;

    if (i > 0) await delay(30 * 60 * 1000); // 30 minutos entre usuarios

    await enviarMensaje(conn, numero, mensajeUsuario);
  }
}

function iniciarRecordatorios(conn) {
  verificarPagos(conn).catch(console.error); // Al iniciar
  setInterval(() => verificarPagos(conn).catch(console.error), 12 * 60 * 60 * 1000); // Cada 12h
}

export { iniciarRecordatorios };
