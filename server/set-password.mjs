// Crea o cambia la contraseña del admin sin mostrarla ni guardarla en texto plano.
// Uso: npm run set-password   (pregunta usuario y contraseña con entrada oculta)
//   o: ADMIN_USER=papa ADMIN_PASSWORD_FILE=/ruta/temporal node server/set-password.mjs
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import { hashPassword } from "./server.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(__dirname, "..", "data"));
fs.mkdirSync(DATA_DIR, { recursive: true });

function ask(q, hidden) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) rl._writeToOutput = (s) => { if (s.includes(q)) rl.output.write(s); else rl.output.write(""); };
    rl.question(q, (a) => { rl.close(); if (hidden) process.stdout.write("\n"); resolve(a.trim()); });
  });
}
const user = process.env.ADMIN_USER || (await ask("Usuario admin [admin]: ")) || "admin";
let pw;
if (process.env.ADMIN_PASSWORD_FILE) pw = fs.readFileSync(process.env.ADMIN_PASSWORD_FILE, "utf8").trim();
else {
  pw = await ask("Contraseña nueva (mín. 10): ", true);
  const again = await ask("Repite la contraseña: ", true);
  if (pw !== again) { console.error("No coinciden."); process.exit(1); }
}
if (pw.length < 10) { console.error("Mínimo 10 caracteres."); process.exit(1); }
fs.writeFileSync(path.join(DATA_DIR, "admin.json"), JSON.stringify({ user, hash: hashPassword(pw) }), { mode: 0o600 });
console.log(`Listo. Usuario "${user}" guardado en ${path.join(DATA_DIR, "admin.json")} (solo el hash).`);
