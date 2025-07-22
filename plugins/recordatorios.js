const fs = require('fs');
const path = require('path');

const OWNER_NUMBER = '+5217771303481'; // Ej: '+549XXXXXXXXX'
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

async function verificarPagos(client) {
  const pagos = cargarPagos();
  const hoy = new Date().getDate();
  const manana = (new Date(Date.now() + 86400000)).getDate();

  for (const numero in pagos) {
    const pago = pagos[numero];
    if (pago.diaPago === hoy || pago.diaPago === manana) {
      const mensajeUsuario = `💸 *Recordatorio de pago*\nHola *${pago.nombre}*, recordá que el *${pago.diaPago}* de cada mes tenés que abonar *${pago.monto} ${pago.bandera}*.\n¡Por favor, realizá tu pago a tiempo!`;
      const mensajeOwner = `📣 *Alerta de pago*\n*${pago.nombre}* (${numero}) debe pagar el *${pago.diaPago}* de este mes.\n💰 Monto: *${pago.monto} ${pago.bandera}*`;

      await enviarMensaje(client, numero, mensajeUsuario);
      await enviarMensaje(client, OWNER_NUMBER, mensajeOwner);
    }
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

  await verificarPagos(client);
}

module.exports = {
  comandoRegistrarPago,
  verificarPagos,
};
