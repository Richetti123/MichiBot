import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pagosFile = path.join(__dirname, 'src', 'pagos.json');
const OWNER_NUMBER = '+5217771303481';

function cargarPagos() {
  if (!fs.existsSync(pagosFile)) return {};
  try {
    return JSON.parse(fs.readFileSync(pagosFile, 'utf8'));
  } catch {
    return {};
  }
}

function guardarPagos(pagos) {
  try {
    fs.writeFileSync(pagosFile, JSON.stringify(pagos, null, 2));
  } catch (e) {
    console.error('Error guardando pagos:', e);
  }
}

async function enviarMensaje(client, numero, mensaje) {
  await client.sendMessage(numero, { text: mensaje });
}

let registrarPagoHandler = async (m, { client }) => {
  const texto = m.text || m.body || '';
  // Remover prefijo y comando
  const comandoYArgs = texto.trim().split(' ');
  comandoYArgs.shift(); // Quita "registrarpago"
  const argsStr = comandoYArgs.join(' ').trim();

  const args = argsStr.split(';').map(s => s.trim());
  if (args.length !== 5) {
    return client.sendMessage(m.from, '❌ Uso incorrecto.\nEjemplo:\n.registrarpago Nombre; +569XXXXXXXX; día; monto; bandera');
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
};

registrarPagoHandler.command = /^registrarpago$/i;
registrarPagoHandler.help = ['registrarpago Nombre; número; día; monto; bandera'];
registrarPagoHandler.tags = ['pagos'];
registrarPagoHandler.exp = 0;

export { registrarPagoHandler };
