"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  IconLogout,
  IconCalendarEvent,
  IconClock,
  IconFileText,
  IconCheck,
  IconList,
} from "@tabler/icons-react";
import {
  getPendientesCitaVirtual,
  getReporteDiario,
  actualizarLead,
  crearSeguimiento,
  setupLeadsTable,
} from "../actions";
import type { LeadRow, SeguimientoConLead } from "../actions";

type Tab = "kanban" | "reporte";

function esc(s: string | null | undefined) {
  return s ?? "";
}

function formatFecha(f: string | null) {
  if (!f) return "—";
  return new Date(f + "T00:00:00").toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function HenrryPage() {
  const [tab, setTab] = useState<Tab>("kanban");
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [reporte, setReporte] = useState<SeguimientoConLead[]>([]);

  useEffect(() => {
    setupLeadsTable().catch(() => {});
  }, []);

  const cargarKanban = useCallback(async () => {
    const data = await getPendientesCitaVirtual();
    setLeads(data);
  }, []);

  const cargarReporte = useCallback(async () => {
    const data = await getReporteDiario();
    setReporte(data);
  }, []);

  useEffect(() => {
    if (tab === "kanban") cargarKanban();
    if (tab === "reporte") cargarReporte();
  }, [tab, cargarKanban, cargarReporte]);

  async function handleCitaCreada(id: number) {
    await actualizarLead(id, { estado: "cita_creada" });
    await crearSeguimiento({ lead_id: id, nota: "Cita creada con el área de Proyectos" });
    cargarKanban();
  }

  // Group report by day
  const reportePorDia = reporte.reduce<Record<string, SeguimientoConLead[]>>((acc, s) => {
    const dia = s.fecha_hora.slice(0, 10);
    if (!acc[dia]) acc[dia] = [];
    acc[dia].push(s);
    return acc;
  }, {});

  const dias = Object.keys(reportePorDia).sort().reverse();

  return (
    <div className="min-h-dvh bg-zinc-50/80 font-sans safe-area-bottom">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-zinc-200 bg-white px-3 py-2 md:px-4 md:py-2.5">
        <Link href="/leads" className="flex items-center gap-2 md:gap-2.5">
          <Image
            src="/logo-azur.png"
            alt="Azur Constructora"
            width={400}
            height={169}
            className="h-7 w-auto md:h-8"
            priority
          />
        </Link>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="text-right text-xs leading-tight md:text-sm">
            <div className="font-medium text-zinc-700">Henrry</div>
            <div className="text-[10px] text-zinc-400 md:text-xs">Jefe · Proyectos</div>
          </div>
          <Link
            href="/leads"
            className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-2.5 py-1 text-[11px] text-zinc-500 no-underline transition-colors hover:bg-zinc-50 hover:text-zinc-700 md:gap-1.5 md:px-3.5 md:py-1.5 md:text-xs"
          >
            <IconLogout size={12} className="md:size-[14px]" />
            <span className="hidden md:inline">Salir</span>
          </Link>
        </div>
      </nav>

      {/* Tab bar */}
      <div className="sticky top-[48px] z-40 flex border-b border-zinc-200 bg-white md:top-[56px]">
        <button
          onClick={() => setTab("kanban")}
          className={`flex flex-1 items-center justify-center gap-1 border-b-2 px-2 py-3 text-xs font-medium transition-all md:gap-1.5 md:px-3 md:py-3.5 md:text-sm ${
            tab === "kanban"
              ? "border-brand-red text-brand-red font-semibold"
              : "border-transparent text-zinc-400"
          }`}
        >
          <IconList size={16} className="md:size-[18px]" />
          <span>Leads pendientes</span>
        </button>
        <button
          onClick={() => setTab("reporte")}
          className={`flex flex-1 items-center justify-center gap-1 border-b-2 px-2 py-3 text-xs font-medium transition-all md:gap-1.5 md:px-3 md:py-3.5 md:text-sm ${
            tab === "reporte"
              ? "border-brand-red text-brand-red font-semibold"
              : "border-transparent text-zinc-400"
          }`}
        >
          <IconFileText size={16} className="md:size-[18px]" />
          <span>Reporte de Seguimiento</span>
        </button>
      </div>

      {/* ─── Tab: Kanban ─── */}
      {tab === "kanban" && (
        <div className={tab === "kanban" ? "block" : "hidden"}>
          <div className="px-3 pt-5 pb-2 text-center md:px-6 md:pt-8">
            <h1 className="text-lg font-bold md:text-2xl" style={{ color: "#c12128" }}>
              Leads listos para coordinar
            </h1>
            <p className="text-xs text-zinc-400 md:text-sm">
              Revisa las solicitudes de cita virtual y coordina con el área de proyectos
            </p>
          </div>

          {/* Counter card */}
          <div
            className="mx-3 mb-3 flex items-center justify-between rounded-2xl px-5 py-4 text-white md:mx-6 md:mb-4 md:px-6 md:py-5"
            style={{ background: "linear-gradient(135deg, #c12128, #d42f36)" }}
          >
            <div>
              <div className="text-3xl font-extrabold leading-none tracking-tight md:text-4xl">{leads.length}</div>
              <div className="mt-0.5 text-xs opacity-85 md:mt-1 md:text-sm">
                {leads.length === 1 ? "lead pendiente por coordinar" : "leads pendientes por coordinar"}
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/12 md:h-12 md:w-12">
              <IconCalendarEvent size={22} className="md:size-[26px]" />
            </div>
          </div>

          {/* Kanban cards */}
          {leads.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center text-zinc-300 md:gap-4 md:py-16">
              <IconCheck size={44} className="opacity-40 md:size-[56px]" />
              <h3 className="text-base font-semibold text-zinc-400 md:text-lg">No hay leads pendientes</h3>
              <p className="text-xs text-zinc-300 md:text-sm">
                Todos los leads con solicitud de cita virtual han sido coordinados.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 px-3 pb-6 md:grid md:grid-cols-[repeat(auto-fill,minmax(360px,1fr))] md:gap-5 md:px-6 md:pb-10">
              {leads.map((l) => (
                <div
                  key={l.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-4 active:shadow-md md:p-5"
                >
                  <div className="mb-2.5 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-base font-bold truncate md:text-lg" style={{ color: "#c12128" }}>
                        {esc(l.nombre)}
                      </div>
                      <div className="font-mono text-xs text-zinc-500 md:text-sm">{esc(l.telefono)}</div>
                    </div>
                    <span className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white md:text-[11px] md:py-1" style={{ background: "#c12128" }}>
                      Pendiente
                    </span>
                  </div>

                  <div className="mb-3 border-b border-zinc-100 pb-3 text-xs leading-relaxed text-zinc-400 md:text-sm md:pb-3.5 md:mb-3.5">
                    {esc(l.detalles) || "—"}
                  </div>

                  {l.preferencia_reunion && (
                    <div className="mb-3 rounded-xl border-2 border-amber-200 bg-amber-50 p-3 md:mb-4 md:p-3.5">
                      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-amber-700 md:text-[11px]">
                        <IconCalendarEvent size={11} className="mr-1 inline align-middle md:size-[12px]" />
                        Preferencia de reunión
                      </div>
                      <div className="text-xs font-semibold text-amber-900 md:text-sm">
                        {esc(l.preferencia_reunion)}
                      </div>
                    </div>
                  )}

                  <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-300 md:mb-3.5 md:text-xs">
                    <span className="flex items-center gap-1">
                      <IconCalendarEvent size={12} className="md:size-[14px]" />
                      Ingreso: {formatFecha(l.fecha_ingreso)}
                    </span>
                    {l.proxima_gestion && (
                      <span className="flex items-center gap-1">
                        <IconClock size={12} className="md:size-[14px]" />
                        Próxima: {formatFecha(l.proxima_gestion)}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleCitaCreada(l.id)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-0 px-4 py-3.5 text-sm font-semibold text-white transition-all active:scale-95 md:px-4 md:py-4 md:text-base"
                    style={{ background: "#38A169" }}
                  >
                    <IconCheck size={18} className="md:size-[20px]" />
                    Cita creada con Proyectos
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Tab: Reporte ─── */}
      {tab === "reporte" && (
        <div className={tab === "reporte" ? "block" : "hidden"}>
          <div className="px-3 pt-5 pb-2 text-center md:px-6 md:pt-8">
            <h1 className="text-lg font-bold md:text-2xl" style={{ color: "#c12128" }}>
              Reporte de Seguimiento
            </h1>
            <p className="text-xs text-zinc-400 md:text-sm">
              Actividad diaria registrada por el equipo
            </p>
          </div>

          <div className="px-3 pb-6 md:px-6 md:pb-8">
            {dias.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center md:py-12">
                <IconFileText size={40} className="text-zinc-200 md:size-[48px]" />
                <h3 className="text-sm font-semibold text-zinc-400 md:text-base">
                  Aún no hay actividad registrada
                </h3>
                <p className="text-xs text-zinc-300 md:text-sm">
                  Los seguimientos aparecerán aquí a medida que Fabrizio gestione los leads.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-3 flex items-center gap-2 md:mb-4 md:gap-2.5">
                  <IconFileText size={20} className="md:size-[24px]" style={{ color: "#c12128" }} />
                  <h2 className="text-lg font-bold md:text-xl" style={{ color: "#c12128" }}>
                    Resumen diario
                  </h2>
                </div>
                {dias.map((dia) => {
                  const fecha = new Date(dia + "T12:00:00");
                  const fechaStr = fecha.toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  });
                  const entradas = reportePorDia[dia];
                  return (
                    <div key={dia} className="mb-3 overflow-hidden rounded-2xl border border-zinc-200 bg-white md:mb-4">
                      <div
                        className="flex items-center justify-between px-3 py-2.5 text-white md:px-4 md:py-3"
                        style={{ background: "#c12128" }}
                      >
                        <span className="flex items-center gap-1.5 text-xs font-semibold md:gap-2 md:text-sm">
                          <IconCalendarEvent size={13} className="md:size-[16px]" />
                          <span className="truncate max-w-[200px] md:max-w-none">{fechaStr}</span>
                        </span>
                        <span className="shrink-0 text-[10px] opacity-80 md:text-xs">
                          {entradas.length} {entradas.length === 1 ? "actividad" : "actividades"}
                        </span>
                      </div>
                      <div className="px-3 py-2.5 md:px-4 md:py-3">
                        {entradas.map((e, idx) => {
                          const hora = e.fecha_hora.length > 10 ? e.fecha_hora.slice(11, 16) : "";
                          return (
                            <div
                              key={`${e.id}-${idx}`}
                              className="flex gap-2 border-b border-zinc-50 py-2 last:border-0 md:gap-3"
                            >
                              <span className="min-w-[36px] shrink-0 pt-0.5 font-mono text-[10px] text-zinc-300 md:min-w-[48px] md:text-xs">
                                {hora || "—"}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="text-[11px] font-semibold truncate md:text-xs" style={{ color: "#c12128" }}>
                                  {esc(e.lead_nombre)}
                                </div>
                                <div className="text-xs leading-relaxed text-zinc-600 md:text-sm">{esc(e.nota)}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
