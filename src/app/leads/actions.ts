"use server";

import { cache } from "react";
import { db } from "@/lib/db";

const ESTADOS = [
  "nuevo",
  "en_seguimiento",
  "rechazado",
  "pendiente_cita_virtual",
  "cita_creada",
] as const;

export type EstadoLead = (typeof ESTADOS)[number];

export type LeadRow = {
  id: number;
  nombre: string;
  telefono: string;
  detalles: string | null;
  preferencia_reunion: string | null;
  estado: EstadoLead;
  fecha_ingreso: string;
  proxima_gestion: string | null;
};

export type SeguimientoRow = {
  id: number;
  lead_id: number;
  fecha_hora: string;
  nota: string;
};

function serialize<T>(rows: unknown): T {
  return JSON.parse(JSON.stringify(rows)) as T;
}

export const getLeads = cache(async () => {
  const result = await db.execute(
    "SELECT * FROM leads ORDER BY fecha_ingreso DESC"
  );
  return serialize<LeadRow[]>(result.rows);
});

export const getLeadsByEstado = cache(async (estado: string | null) => {
  if (!estado || estado === "todos") {
    return getLeads();
  }
  if (estado === "pendientes_llamar") {
    const result = await db.execute(
      "SELECT * FROM leads WHERE estado IN ('nuevo', 'en_seguimiento') ORDER BY fecha_ingreso DESC"
    );
    return serialize<LeadRow[]>(result.rows);
  }
  const result = await db.execute({
    sql: "SELECT * FROM leads WHERE estado = ? ORDER BY fecha_ingreso DESC",
    args: [estado],
  });
  return serialize<LeadRow[]>(result.rows);
});

export const getLeadById = cache(async (id: number) => {
  const result = await db.execute({
    sql: "SELECT * FROM leads WHERE id = ?",
    args: [id],
  });
  const rows = serialize<LeadRow[]>(result.rows);
  return rows[0] ?? null;
});

export async function crearLead(data: {
  nombre: string;
  telefono: string;
  detalles?: string | null;
}) {
  const result = await db.execute({
    sql: "INSERT INTO leads (nombre, telefono, detalles) VALUES (?, ?, ?)",
    args: [data.nombre, data.telefono, data.detalles ?? null],
  });
  return result.lastInsertRowid;
}

export async function actualizarLead(
  id: number,
  data: {
    nombre?: string;
    telefono?: string;
    detalles?: string | null;
    preferencia_reunion?: string | null;
    estado?: EstadoLead;
    proxima_gestion?: string | null;
  }
) {
  const sets: string[] = [];
  const args: Array<string | number | null> = [];

  if (data.nombre !== undefined) {
    sets.push("nombre = ?");
    args.push(data.nombre);
  }
  if (data.telefono !== undefined) {
    sets.push("telefono = ?");
    args.push(data.telefono);
  }
  if (data.detalles !== undefined) {
    sets.push("detalles = ?");
    args.push(data.detalles);
  }
  if (data.preferencia_reunion !== undefined) {
    sets.push("preferencia_reunion = ?");
    args.push(data.preferencia_reunion);
  }
  if (data.estado !== undefined) {
    sets.push("estado = ?");
    args.push(data.estado);
  }
  if (data.proxima_gestion !== undefined) {
    sets.push("proxima_gestion = ?");
    args.push(data.proxima_gestion);
  }

  if (sets.length === 0) return;

  args.push(id);
  await db.execute({
    sql: `UPDATE leads SET ${sets.join(", ")} WHERE id = ?`,
    args,
  });
}

export async function crearSeguimiento(data: {
  lead_id: number;
  nota: string;
}) {
  const result = await db.execute({
    sql: "INSERT INTO seguimientos (lead_id, nota) VALUES (?, ?)",
    args: [data.lead_id, data.nota],
  });

  const lead = await getLeadById(data.lead_id);
  if (lead && lead.estado === "nuevo") {
    await db.execute({
      sql: "UPDATE leads SET estado = 'en_seguimiento' WHERE id = ?",
      args: [data.lead_id],
    });
  }

  return result.lastInsertRowid;
}

export const getSeguimientos = cache(async (leadId: number) => {
  const result = await db.execute({
    sql: "SELECT * FROM seguimientos WHERE lead_id = ? ORDER BY fecha_hora DESC",
    args: [leadId],
  });
  return serialize<SeguimientoRow[]>(result.rows);
});

export const getPendientesCitaVirtual = cache(async () => {
  const result = await db.execute(
    "SELECT * FROM leads WHERE estado = 'pendiente_cita_virtual' ORDER BY fecha_ingreso DESC"
  );
  return serialize<LeadRow[]>(result.rows);
});

export type SeguimientoConLead = {
  id: number;
  lead_id: number;
  fecha_hora: string;
  nota: string;
  lead_nombre: string;
};

export const getReporteDiario = cache(async () => {
  const result = await db.execute(`
    SELECT
      s.id, s.lead_id, s.fecha_hora, s.nota,
      l.nombre as lead_nombre
    FROM seguimientos s
    JOIN leads l ON l.id = s.lead_id
    ORDER BY s.fecha_hora DESC
  `);
  return serialize<SeguimientoConLead[]>(result.rows);
});

export async function setupLeadsTable() {
  await db.execute(`CREATE TABLE IF NOT EXISTS leads (
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
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS seguimientos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER NOT NULL,
    fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    nota TEXT NOT NULL,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
  )`);

  return { ok: true };
}
