// En el mismo archivo o uno aparte que importes
async function verificarPagos(client) {
  const pagos = cargarPagos();
  const hoy = new Date().getDate();
  const manana = new Date(Date.now() + 86400000).getDate();

  // Filtrar pagos para hoy y mañana
  const deudoresHoy = Object.entries(pagos).filter(([_, pago]) => pago.diaPago === hoy);
  const deudoresManana = Object.entries(pagos).filter(([_, pago]) => pago.diaPago === manana);

  // Enviar resumen al owner si hay pagos hoy o mañana
  if (deudoresHoy.length > 0 || deudoresManana.length > 0) {
    let mensajeOwner = '';
    if (deudoresHoy.length > 0) {
      mensajeOwner += `📅 *Pagos para hoy (${hoy}):*\n`;
      deudoresHoy.forEach(([_, p]) => {
        mensajeOwner += `- ${p.nombre}: ${p.monto} ${p.bandera}\n`;
      });
    }
    if (deudoresManana.length > 0) {
      if (mensajeOwner) mensajeOwner += '\n';
      mensajeOwner += `📅 *Pagos para mañana (${manana}):*\n`;
      deudoresManana.forEach(([_, p]) => {
        mensajeOwner += `- ${p.nombre}: ${p.monto} ${p.bandera}\n`;
      });
    }

    await enviarMensaje(client, OWNER_NUMBER, mensajeOwner);
  }

  // Enviar recordatorio individual a cada deudor de hoy con 30 min de separación
  for (let i = 0; i < deudoresHoy.length; i++) {
    const [numero, pago] = deudoresHoy[i];
    const mensajeUsuario = `💸 *Recordatorio de pago*\nHola *${pago.nombre}*, recordá que el *${pago.diaPago}* de cada mes tenés que abonar *${pago.monto} ${pago.bandera}*.\n¡Por favor, realizá tu pago a tiempo!`;

    if (i > 0) await new Promise(r => setTimeout(r, 30 * 60 * 1000)); // 30 minutos
    await enviarMensaje(client, numero, mensajeUsuario);
  }
}

function iniciarRecordatorios(client) {
  verificarPagos(client).catch(console.error);
  setInterval(() => {
    verificarPagos(client).catch(console.error);
  }, 12 * 60 * 60 * 1000); // Cada 12 horas
}

export { verificarPagos, iniciarRecordatorios };
