import { db } from "./db";

const LEADS_TABLE_SQL = `CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    telefono TEXT NOT NULL,
    detalles TEXT,
    preferencia_reunion TEXT,
    estado TEXT NOT NULL DEFAULT 'nuevo' CHECK (estado IN (
        'nuevo', 
        'en_seguimiento', 
        'rechazado', 
        'pendiente_cita_virtual', 
        'cita_creada'
    )),
    fecha_ingreso DATETIME DEFAULT CURRENT_TIMESTAMP,
    proxima_gestion DATE
)`;

const SEGUIMIENTOS_TABLE_SQL = `CREATE TABLE IF NOT EXISTS seguimientos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER NOT NULL,
    fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    nota TEXT NOT NULL,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
)`;

export async function setupDatabase() {
  await db.execute(LEADS_TABLE_SQL);
  await db.execute(SEGUIMIENTOS_TABLE_SQL);
}
