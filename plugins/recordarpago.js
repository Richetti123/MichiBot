import { cargarPagos, enviarMensaje } from '../lib/verificadorPagos.js';

async function handler(mensaje, client) {
  const args = mensaje.body.trim().split(' ').slice(1);
  if (args.length !== 1) {
    await client.sendMessage(mensaje.from, '❌ Uso: .recordarPago +521XXXXXXXXXX');
    return;
  }
  const numero = args[0];
  const pagos = cargarPagos();

  if (!pagos[numero]) {
    await client.sendMessage(mensaje.from, '❌ Número no registrado en pagos.');
    return;
  }

  const pago = pagos[numero];
  const mensajeUsuario = `💸 *Recordatorio de pago*\nHola *${pago.nombre}*, recordá que el *${pago.diaPago}* de cada mes tenés que abonar *${pago.monto} ${pago.bandera}*.\n¡Por favor, realizá tu pago a tiempo!`;

  await enviarMensaje(client, numero, mensajeUsuario);
  await enviarMensaje(client, '+5217771303481', `✅ Recordatorio enviado a ${pago.nombre} (${numero})`);

  await client.sendMessage(mensaje.from, `✅ Mensaje de recordatorio enviado a ${pago.nombre}.`);
}

handler.help = ['recordarPago'];
handler.tags = ['pagos'];
handler.command = /^recordarPago$/i;

export default handler;
