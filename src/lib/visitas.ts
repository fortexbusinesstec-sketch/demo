import { db } from "./db";

export type Visita = {
  id: number;
  cliente_id: number;
  fecha_visita: string;
  resultado: "Interesado" | "Cotización" | "No interesado" | "Seguimiento" | "Cerrado" | null;
  notas: string | null;
  foto_url_1: string | null;
  foto_url_2: string | null;
  foto_url_3: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
};

export type CreateVisitaInput = Omit<Visita, "id" | "fecha_visita" | "created_at">;
export type UpdateVisitaInput = Partial<Omit<Visita, "id" | "fecha_visita" | "created_at">>;

export async function getVisitas() {
  const result = await db.execute("SELECT * FROM visitas ORDER BY fecha_visita DESC");
  return result.rows as unknown as Visita[];
}

export async function getVisitasByClienteId(cliente_id: number) {
  const result = await db.execute({
    sql: "SELECT * FROM visitas WHERE cliente_id = ? ORDER BY fecha_visita DESC",
    args: [cliente_id],
  });
  return result.rows as unknown as Visita[];
}

export async function getVisitaById(id: number) {
  const result = await db.execute({
    sql: "SELECT * FROM visitas WHERE id = ?",
    args: [id],
  });
  return result.rows[0] as unknown as Visita | undefined;
}

export async function createVisita(input: CreateVisitaInput) {
  const result = await db.execute({
    sql: `INSERT INTO visitas (cliente_id, resultado, notas, foto_url_1, foto_url_2, foto_url_3, lat, lng)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      input.cliente_id,
      input.resultado ?? null,
      input.notas ?? null,
      input.foto_url_1 ?? null,
      input.foto_url_2 ?? null,
      input.foto_url_3 ?? null,
      input.lat ?? null,
      input.lng ?? null,
    ],
  });
  return result.lastInsertRowid;
}

export async function updateVisita(id: number, input: UpdateVisitaInput) {
  const fields = Object.keys(input) as (keyof UpdateVisitaInput)[];
  if (fields.length === 0) return;

  const setClause = fields.map((f) => `${f} = ?`).join(", ");
  const values = fields.map((f) => input[f] ?? null);

  await db.execute({
    sql: `UPDATE visitas SET ${setClause} WHERE id = ?`,
    args: [...values, id],
  });
}

export async function deleteVisita(id: number) {
  await db.execute({
    sql: "DELETE FROM visitas WHERE id = ?",
    args: [id],
  });
}
