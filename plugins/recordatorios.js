const fs = require('fs'); 
const path = require('path');

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

// Función para esperar (delay)
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function verificarPagos(client) {
  const pagos = cargarPagos();
  const hoy = new Date().getDate();
  const manana = (new Date(Date.now() + 86400000)).getDate();

  // Filtrar pagos que vencen hoy o mañana
  const deudoresHoyManana = Object.entries(pagos)
    .filter(([numero, pago]) => pago.diaPago === hoy || pago.diaPago === manana);

  if (deudoresHoyManana.length === 0) return;

  // Separar por día para mensaje al owner
  const listaPorDia = { [hoy]: [], [manana]: [] };
  deudoresHoyManana.forEach(([_, pago]) => {
    if (pago.diaPago === hoy) listaPorDia[hoy].push(pago);
    else listaPorDia[manana].push(pago);
  });

  // Construir mensaje para owner con lista de hoy y mañana
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

  // Enviar mensaje único al owner
  await enviarMensaje(client, OWNER_NUMBER, mensajeOwner);

  // Enviar mensajes individuales con delay 30 min solo para los que deben hoy
  const deudoresHoy = deudoresHoyManana.filter(([_, pago]) => pago.diaPago === hoy);

  for (let i = 0; i < deudoresHoy.length; i++) {
    const [numero, pago] = deudoresHoy[i];
    const mensajeUsuario = `💸 *Recordatorio de pago*\nHola *${pago.nombre}*, recordá que el *${pago.diaPago}* de cada mes tenés que abonar *${pago.monto} ${pago.bandera}*.\n¡Por favor, realizá tu pago a tiempo!`;

    if (i > 0) await delay(30 * 60 * 1000); // 30 minutos en ms

    await enviarMensaje(client, numero, mensajeUsuario);
  }
}

async function comandoRegistrarPago(mensaje, client) {
  const texto = mensaje.body || '';
  const args = texto.split(' ').slice(1).join(' ').split(';').map(s => s.trim());

  if (args.length !== 5) {
    await client.sendMessage(mensaje.from, '❌ Uso incorrecto. Ejemplo:\n.registrarpago Nombre; +569XXXXXXXX; día; monto; bandera');
    return;
  }

  const [nombre, numero, diaStr, monto, bandera] = args;
  const diaPago = parseInt(diaStr, 10);

  if (!nombre || !numero || isNaN(diaPago) || !monto || !bandera) {
    await client.sendMessage(mensaje.from, '❌ Datos inválidos. Verifica que los campos estén correctos.');
    return;
  }

  const pagos = cargarPagos();

  pagos[numero] = {
    nombre,
    diaPago,
    monto,
    bandera
  };

  guardarPagos(pagos);

  await client.sendMessage(mensaje.from, `✅ Pago registrado:\nNombre: ${nombre}\nNúmero: ${numero}\nDía: ${diaPago}\nMonto: ${monto} ${bandera}`);

  // Ejecutar verificación y envío de recordatorios después de agregar
  await verificarPagos(client);
}

module.exports = {
  comandoRegistrarPago,
  verificarPagos,
};
