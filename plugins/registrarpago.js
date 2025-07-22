// plugins/registrarpago.js
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

function guardarPagos(pagos) {
  try {
    fs.writeFileSync(pagosFile, JSON.stringify(pagos, null, 2));
  } catch (e) {
    console.error('Error guardando pagos:', e);
  }
}

const handler = async (m, { conn }) => {
  const texto = m.text || m.body || '';
  const comandoYArgs = texto.trim().split(' ');
  comandoYArgs.shift(); // quitar "registrarpago"
  const argsStr = comandoYArgs.join(' ').trim();

  const args = argsStr.split(';').map(s => s.trim());
  if (args.length !== 5) {
    return conn.sendMessage(m.chat, { text: '❌ Uso incorrecto.\nEjemplo:\n.registrarpago Nombre; +569XXXXXXXX; día; monto; bandera' });
  }

  const [nombre, numero, diaStr, monto, bandera] = args;
  const diaPago = parseInt(diaStr, 10);

  if (!nombre || !numero || isNaN(diaPago) || !monto || !bandera) {
    return conn.sendMessage(m.chat, { text: '❌ Datos inválidos. Verifica que los campos estén correctos.' });
  }

  const pagos = cargarPagos();
  pagos[numero] = { nombre, diaPago, monto, bandera };
  guardarPagos(pagos);

  await conn.sendMessage(m.chat, {
    text: `✅ Pago registrado:\nNombre: ${nombre}\nNúmero: ${numero}\nDía: ${diaPago}\nMonto: ${monto} ${bandera}`
  });
};

handler.command = /^registrarpago$/i;
handler.help = ['registrarpago'];
handler.tags = ['pagos'];
handler.exp = 0;

export default handler;
