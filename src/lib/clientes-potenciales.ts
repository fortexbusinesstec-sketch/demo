import { db } from "./db";

export type ClientePotencial = {
  id: number;
  ciudad: "Chiclayo" | "Trujillo" | "Chimbote";
  distrito: string | null;
  tipo_cliente: "EPS" | "Gerencia Regional" | "Constructora" | "Ferretería" | "Inmobiliaria" | "Otro";
  nombre_entidad: string;
  direccion: string | null;
  referencia: string | null;
  telefono: string | null;
  email: string | null;
  contacto_clave: string | null;
  cargo_contacto: string | null;
  probabilidad: "Alta" | "Media" | "Baja" | null;
  volumen_estimado: ">500" | "50-200" | "<50" | null;
  lat: string | null;
  lng: string | null;
  estado: "Por visitar" | "Visitado" | "Cotización enviada" | "Negociación" | "Cerrado" | "Rechazado";
  observaciones: string | null;
  fuente: string;
  created_at: string;
  updated_at: string;
};

export type CreateClienteInput = Omit<ClientePotencial, "id" | "created_at" | "updated_at">;
export type UpdateClienteInput = Partial<Omit<ClientePotencial, "id" | "created_at" | "updated_at">>;

export async function getClientes() {
  const result = await db.execute("SELECT * FROM clientes_potenciales ORDER BY created_at DESC");
  return result.rows as unknown as ClientePotencial[];
}

export async function getClienteById(id: number) {
  const result = await db.execute({
    sql: "SELECT * FROM clientes_potenciales WHERE id = ?",
    args: [id],
  });
  return result.rows[0] as unknown as ClientePotencial | undefined;
}

export async function createCliente(input: CreateClienteInput) {
  const result = await db.execute({
    sql: `INSERT INTO clientes_potenciales (ciudad, distrito, tipo_cliente, nombre_entidad, direccion, referencia, telefono, email, contacto_clave, cargo_contacto, probabilidad, volumen_estimado, lat, lng, estado, observaciones, fuente)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      input.ciudad,
      input.distrito ?? null,
      input.tipo_cliente,
      input.nombre_entidad,
      input.direccion ?? null,
      input.referencia ?? null,
      input.telefono ?? null,
      input.email ?? null,
      input.contacto_clave ?? null,
      input.cargo_contacto ?? null,
      input.probabilidad ?? null,
      input.volumen_estimado ?? null,
      input.lat ?? null,
      input.lng ?? null,
      input.estado,
      input.observaciones ?? null,
      input.fuente,
    ],
  });
  return result.lastInsertRowid;
}

export async function updateCliente(id: number, input: UpdateClienteInput) {
  const fields = Object.keys(input) as (keyof UpdateClienteInput)[];
  if (fields.length === 0) return;

  const setClause = fields.map((f) => `${f} = ?`).join(", ");
  const values = fields.map((f) => input[f] ?? null);

  await db.execute({
    sql: `UPDATE clientes_potenciales SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    args: [...values, id],
  });
}

export async function deleteCliente(id: number) {
  await db.execute({
    sql: "DELETE FROM clientes_potenciales WHERE id = ?",
    args: [id],
  });
}
