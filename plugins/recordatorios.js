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
  try {
    return JSON.parse(fs.readFileSync(pagosFile, 'utf8'));
  } catch (e) {
    console.error('Error leyendo pagos.json:', e);
    return {};
  }
}

function guardarPagos(pagos) {
  try {
    fs.writeFileSync(pagosFile, JSON.stringify(pagos, null, 2));
  } catch (e) {
    console.error('Error escribiendo pagos.json:', e);
  }
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

  // Filtrar pagos para hoy o mañana
  const deudoresHoyManana = Object.entries(pagos)
    .filter(([_, pago]) => pago.diaPago === hoy || pago.diaPago === manana);

  if (deudoresHoyManana.length === 0) return;

  // Crear mensajes para owner
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

  await enviarMensaje(client, OWNER_NUMBER, mensajeOwner);

  // Enviar recordatorios a usuarios con pago hoy, con delay entre cada uno
  const deudoresHoy = deudoresHoyManana.filter(([_, pago]) => pago.diaPago === hoy);

  for (let i = 0; i < deudoresHoy.length; i++) {
    const [numero, pago] = deudoresHoy[i];
    const mensajeUsuario = `💸 *Recordatorio de pago*\nHola *${pago.nombre}*, recordá que el *${pago.diaPago}* de cada mes tenés que abonar *${pago.monto} ${pago.bandera}*.\n¡Por favor, realizá tu pago a tiempo!`;

    if (i > 0) await delay(30 * 60 * 1000); // Espera 30 minutos antes de enviar al siguiente

    await enviarMensaje(client, numero, mensajeUsuario);
  }
}

// Handler para registrar pagos desde comando
let handler = async (m, { client, text }) => {
  const args = text.split(';').map(s => s.trim());
  if (args.length !== 5) {
    return client.sendMessage(m.from, '❌ Uso incorrecto. Ejemplo:\n.registrarpago Nombre; +569XXXXXXXX; día; monto; bandera');
  }
  const [nombre, numero, diaStr, monto, bandera] = args;
  const diaPago = parseInt(diaStr, 10);
  if (!nombre || !numero || isNaN(diaPago) || !monto || !bandera) {
    return client.sendMessage(m.from, '❌ Datos inválidos. Verifica que los campos estén correctos.');
  }

  const pagos = cargarPagos();
  pagos[numero] = { nombre, diaPago, monto, bandera };
  guardarPagos(pagos);

  await client.sendMessage(m.from, `✅ Pago registrado:\nNombre: ${nombre}\nNúmero: ${numero}\nDía: ${diaPago}\nMonto: ${monto} ${bandera}`);

  await verificarPagos(client);
};


// Función para iniciar recordatorios automáticos cada 12 horas
function iniciarRecordatorios(client) {
  verificarPagos(client).catch(console.error);

  setInterval(() => {
    verificarPagos(client).catch(console.error);
  }, 12 * 60 * 60 * 1000);
}

export { iniciarRecordatorios };

handler.help = ['registrarpago Nombre; número; día; monto; bandera'];
handler.tags = ['pagos'];
handler.command = /^registrarpago$/i;
handler.exp = 0;

export default handler;
