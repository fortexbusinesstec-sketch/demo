"use server";

import { cache } from "react";
import { db } from "@/lib/db";

function serialize<T>(rows: unknown): T {
  return JSON.parse(JSON.stringify(rows)) as T;
}

export type ClienteRow = {
  id: number;
  ciudad: string;
  distrito: string | null;
  referencia: string | null;
  tipo_cliente: string;
  nombre_entidad: string;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  contacto_clave: string | null;
  cargo_contacto: string | null;
  probabilidad: string | null;
  volumen_estimado: string | null;
  lat: string | null;
  lng: string | null;
  estado: string;
  observaciones: string | null;
  fuente: string;
  created_at: string;
  updated_at: string;
};

export type ConteoCiudad = {
  ciudad: string;
  por_visitar: number;
};

export const getClientesByCiudad = cache(async (ciudad: string) => {
  const result = await db.execute({
    sql: "SELECT * FROM clientes_potenciales WHERE ciudad = ? ORDER BY nombre_entidad ASC",
    args: [ciudad],
  });
  return serialize<ClienteRow[]>(result.rows);
});

export const getClientesByCiudadGrouped = cache(async (ciudad: string) => {
  const result = await db.execute({
    sql: "SELECT * FROM clientes_potenciales WHERE ciudad = ? ORDER BY distrito ASC, tipo_cliente ASC, nombre_entidad ASC",
    args: [ciudad],
  });
  return serialize<ClienteRow[]>(result.rows);
});

export async function getConteoPorVisitar(ciudad: string) {
  const result = await db.execute({
    sql: "SELECT COUNT(*) as count FROM clientes_potenciales WHERE ciudad = ? AND estado = 'Por visitar'",
    args: [ciudad],
  });
  const row = serialize<Record<string, unknown>>(result.rows[0]);
  return Number(row.count);
}

export const getAllConteos = cache(async () => {
  const result = await db.execute(
    "SELECT ciudad, COUNT(*) as por_visitar FROM clientes_potenciales WHERE estado = 'Por visitar' GROUP BY ciudad"
  );
  return serialize<ConteoCiudad[]>(result.rows);
});

export const getClientesByCiudadAndTipo = cache(async (ciudad: string, tipo: string | null) => {
  if (!tipo) {
    return getClientesByCiudad(ciudad);
  }
  const result = await db.execute({
    sql: "SELECT * FROM clientes_potenciales WHERE ciudad = ? AND tipo_cliente = ? ORDER BY nombre_entidad ASC",
    args: [ciudad, tipo],
  });
  return serialize<ClienteRow[]>(result.rows);
});

export async function crearVisita(data: {
  cliente_id: number;
  resultado: string;
  notas: string | null;
  foto_url_1: string | null;
  foto_url_2: string | null;
  foto_url_3: string | null;
  lat: number | null;
  lng: number | null;
}) {
  const result = await db.execute({
    sql: `INSERT INTO visitas (cliente_id, resultado, notas, foto_url_1, foto_url_2, foto_url_3, lat, lng)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      data.cliente_id,
      data.resultado,
      data.notas,
      data.foto_url_1,
      data.foto_url_2,
      data.foto_url_3,
      data.lat,
      data.lng,
    ],
  });

  const estadoMap: Record<string, string> = {
    Interesado: "Visitado",
    Cotización: "Cotización enviada",
    "No interesado": "Rechazado",
    Seguimiento: "Negociación",
    Cerrado: "Cerrado",
  };

  const nuevoEstado = estadoMap[data.resultado] || "Visitado";

  await db.execute({
    sql: "UPDATE clientes_potenciales SET estado = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    args: [nuevoEstado, data.cliente_id],
  });

  return result.lastInsertRowid;
}

export async function actualizarCliente(
  id: number,
  data: {
    ciudad: string;
    distrito: string | null;
    tipo_cliente: string;
    nombre_entidad: string;
    direccion: string | null;
    referencia: string | null;
    telefono: string | null;
    email: string | null;
    contacto_clave: string | null;
    cargo_contacto: string | null;
    probabilidad: string | null;
    volumen_estimado: string | null;
    lat: string | null;
    lng: string | null;
    observaciones: string | null;
  }
) {
  await db.execute({
    sql: `UPDATE clientes_potenciales SET
          ciudad = ?, distrito = ?, tipo_cliente = ?, nombre_entidad = ?,
          direccion = ?, referencia = ?, telefono = ?, email = ?,
          contacto_clave = ?, cargo_contacto = ?, probabilidad = ?,
          volumen_estimado = ?, lat = ?, lng = ?, observaciones = ?,
          updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
    args: [
      data.ciudad,
      data.distrito,
      data.tipo_cliente,
      data.nombre_entidad,
      data.direccion,
      data.referencia,
      data.telefono,
      data.email,
      data.contacto_clave,
      data.cargo_contacto,
      data.probabilidad,
      data.volumen_estimado,
      data.lat,
      data.lng,
      data.observaciones,
      id,
    ],
  });
}

export async function crearCliente(data: {
  ciudad: string;
  distrito: string | null;
  tipo_cliente: string;
  nombre_entidad: string;
  direccion: string | null;
  referencia: string | null;
  telefono: string | null;
  email: string | null;
  contacto_clave: string | null;
  cargo_contacto: string | null;
  probabilidad: string | null;
  volumen_estimado: string | null;
  lat: string | null;
  lng: string | null;
  observaciones: string | null;
  fuente?: string;
}) {
  const result = await db.execute({
    sql: `INSERT INTO clientes_potenciales
          (ciudad, distrito, tipo_cliente, nombre_entidad, direccion, referencia, telefono, email, contacto_clave, cargo_contacto, probabilidad, volumen_estimado, lat, lng, observaciones, fuente)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      data.ciudad,
      data.distrito,
      data.tipo_cliente,
      data.nombre_entidad,
      data.direccion,
      data.referencia,
      data.telefono,
      data.email,
      data.contacto_clave,
      data.cargo_contacto,
      data.probabilidad,
      data.volumen_estimado,
      data.lat,
      data.lng,
      data.observaciones,
      data.fuente ?? "Web",
    ],
  });
  return result.lastInsertRowid;
}
