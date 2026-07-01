"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  IconUsers,
  IconLogout,
  IconList,
  IconPhone,
  IconCalendarEvent,
  IconPlus,
  IconChevronRight,
  IconClock,
  IconX,
  IconMessage,
  IconVideo,
  IconUserX,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getLeadsByEstado, crearLead, actualizarLead, crearSeguimiento, getSeguimientos, setupLeadsTable } from "../actions";
import type { LeadRow, SeguimientoRow } from "../actions";

type Filtro = "todos" | "pendientes_llamar" | "pendiente_cita_virtual";
type AccionGestion = null | "llamar_despues" | "no_interesado" | "reunion_virtual" | "agregar_nota";

const filtros: { key: Filtro; label: string; icon: typeof IconList }[] = [
  { key: "todos", label: "Todos", icon: IconList },
  { key: "pendientes_llamar", label: "Pendientes de llamar", icon: IconPhone },
  { key: "pendiente_cita_virtual", label: "Pendientes Cita Virtual", icon: IconCalendarEvent },
];

const estadoLabels: Record<string, string> = {
  nuevo: "Nuevo",
  en_seguimiento: "Seguimiento",
  pendiente_cita_virtual: "Cita Virtual",
  rechazado: "Rechazado",
  cita_creada: "Cita Creada",
};

const estadoBadge: Record<string, string> = {
  nuevo: "bg-red-100 text-brand-red",
  en_seguimiento: "bg-amber-100 text-amber-800",
  pendiente_cita_virtual: "bg-purple-100 text-brand-purple",
  rechazado: "bg-zinc-100 text-zinc-600",
  cita_creada: "bg-emerald-100 text-emerald-800",
};

function esc(s: string | null | undefined) {
  return s ?? "";
}

export default function FabrizioPage() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [todas, setTodas] = useState<LeadRow[]>([]);
  const [filtroActual, setFiltroActual] = useState<Filtro>("todos");
  const [loading, setLoading] = useState(true);

  const [nuevoOpen, setNuevoOpen] = useState(false);
  const [gestionarOpen, setGestionarOpen] = useState(false);
  const [gestionandoId, setGestionandoId] = useState<number | null>(null);
  const [gestionandoLead, setGestionandoLead] = useState<LeadRow | null>(null);
  const [seguimientos, setSeguimientos] = useState<SeguimientoRow[]>([]);
  const [accion, setAccion] = useState<AccionGestion>(null);

  const [formNombre, setFormNombre] = useState("");
  const [formTelefono, setFormTelefono] = useState("");
  const [formDetalles, setFormDetalles] = useState("");
  const [inputProximaGestion, setInputProximaGestion] = useState("");
  const [inputPreferencia, setInputPreferencia] = useState("");
  const [inputNota, setInputNota] = useState("");

  useEffect(() => {
    setupLeadsTable().catch(() => {});
  }, []);

  const cargarLeads = useCallback(async (filtro: Filtro) => {
    setLoading(true);
    const [filtradas, todas] = await Promise.all([
      getLeadsByEstado(filtro),
      getLeadsByEstado("todos"),
    ]);
    setLeads(filtradas);
    setTodas(todas);
    setLoading(false);
  }, []);

  useEffect(() => {
    cargarLeads(filtroActual);
  }, [filtroActual, cargarLeads]);

  const handleFiltrar = useCallback((filtro: Filtro) => {
    setFiltroActual(filtro);
  }, []);

  const contar = useCallback(
    (filtro: Filtro) => {
      if (filtro === "todos") return todas.length;
      if (filtro === "pendientes_llamar")
        return todas.filter((l) => l.estado === "nuevo" || l.estado === "en_seguimiento").length;
      if (filtro === "pendiente_cita_virtual")
        return todas.filter((l) => l.estado === "pendiente_cita_virtual").length;
      return 0;
    },
    [todas]
  );

  async function handleGuardarNuevo() {
    if (!formNombre.trim()) return;
    await crearLead({
      nombre: formNombre.trim(),
      telefono: formTelefono.trim(),
      detalles: formDetalles.trim() || null,
    });
    setNuevoOpen(false);
    setFormNombre("");
    setFormTelefono("");
    setFormDetalles("");
    cargarLeads(filtroActual);
  }

  async function handleAbrirGestionar(lead: LeadRow) {
    setGestionandoId(lead.id);
    setGestionandoLead(lead);
    setAccion(null);
    setInputProximaGestion(new Date().toISOString().slice(0, 10));
    setInputPreferencia("");
    setInputNota("");
    const segs = await getSeguimientos(lead.id);
    setSeguimientos(segs);
    setGestionarOpen(true);
  }

  async function handleConfirmarLlamarDespues() {
    if (!inputProximaGestion || gestionandoId === null) return;
    await actualizarLead(gestionandoId, {
      estado: "en_seguimiento",
      proxima_gestion: inputProximaGestion,
    });
    await crearSeguimiento({
      lead_id: gestionandoId,
      nota: `Llamar después programado para ${inputProximaGestion}`,
    });
    setGestionarOpen(false);
    cargarLeads(filtroActual);
  }

  async function handleNoInteresado() {
    if (gestionandoId === null) return;
    await actualizarLead(gestionandoId, { estado: "rechazado" });
    await crearSeguimiento({ lead_id: gestionandoId, nota: "Cliente no interesado" });
    setGestionarOpen(false);
    cargarLeads(filtroActual);
  }

  async function handleConfirmarReunionVirtual() {
    if (!inputPreferencia.trim() || gestionandoId === null) return;
    await actualizarLead(gestionandoId, {
      estado: "pendiente_cita_virtual",
      preferencia_reunion: inputPreferencia.trim(),
    });
    await crearSeguimiento({
      lead_id: gestionandoId,
      nota: `Cliente solicita reunión virtual: ${inputPreferencia.trim()}`,
    });
    setGestionarOpen(false);
    cargarLeads(filtroActual);
  }

  async function handleConfirmarNota() {
    if (!inputNota.trim() || gestionandoId === null) return;
    await crearSeguimiento({ lead_id: gestionandoId, nota: inputNota.trim() });
    const segs = await getSeguimientos(gestionandoId);
    setSeguimientos(segs);
    setAccion(null);
    setInputNota("");
    cargarLeads(filtroActual);
  }

  function formatFecha(f: string | null) {
    if (!f) return "—";
    return new Date(f + "T00:00:00").toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function formatFechaHora(f: string) {
    const d = new Date(f);
    return d.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="min-h-dvh bg-zinc-50/80 pb-24 font-sans safe-area-bottom">
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
            <div className="font-medium text-zinc-700">Fabrizio</div>
            <div className="text-[10px] text-zinc-400 md:text-xs">Asistente</div>
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

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto px-3 py-3 pb-1.5 md:gap-2.5 md:px-4 md:py-4 md:pb-2 [-webkit-overflow-scrolling:touch] [scrollbar-width:none]">
        {filtros.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => handleFiltrar(key)}
            className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-medium transition-all active:scale-95 md:gap-2 md:px-5 md:py-2.5 md:text-sm ${
              filtroActual === key
                ? "border-brand-red bg-brand-red text-white"
                : "border-zinc-200 bg-white text-zinc-600 hover:border-brand-red hover:text-brand-red"
            }`}
          >
            <Icon size={14} className="md:size-[16px]" />
            <span className="hidden xs:inline">{label}</span>
            <span className="xs:hidden">{key === "todos" ? "Todos" : key === "pendientes_llamar" ? "Llamar" : "Cita"}</span>
            <span
              className={`ml-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold md:ml-0.5 md:px-2 md:py-0.5 md:text-xs ${
                filtroActual === key ? "bg-white/20" : "bg-black/8"
              }`}
            >
              {contar(key)}
            </span>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 pb-2 text-xs text-zinc-400 md:gap-2 md:px-4 md:py-2 md:pb-4 md:text-sm">
        <IconUsers size={14} className="md:size-[16px]" />
        <span>
          {leads.length} lead{leads.length !== 1 ? "s" : ""} encontrado{leads.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Content */}
      <div className="px-3 md:px-4">
        {loading ? (
          <p className="py-8 text-center text-xs text-zinc-300 md:py-12 md:text-sm">Cargando...</p>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center text-zinc-300 md:py-12">
            <IconList size={40} className="opacity-50 md:size-[48px]" />
            <p className="text-sm font-medium text-zinc-400 md:text-base">No hay leads en esta categoría</p>
          </div>
        ) : (
          <>
            {/* Table - desktop */}
            <div className="hidden overflow-hidden rounded-2xl border border-zinc-200 bg-white md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    <th className="px-4 py-3.5">Nombre</th>
                    <th className="px-4 py-3.5">Teléfono</th>
                    <th className="px-4 py-3.5">Detalles</th>
                    <th className="px-4 py-3.5">Estado</th>
                    <th className="px-4 py-3.5">Próxima gestión</th>
                    <th className="px-4 py-3.5" />
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id} className="border-b border-zinc-100 last:border-0">
                      <td className="px-4 py-3.5 font-semibold" style={{ color: "#c12128" }}>
                        {esc(l.nombre)}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-sm text-zinc-600">{esc(l.telefono)}</td>
                      <td className="max-w-[200px] truncate px-4 py-3.5 text-sm text-zinc-400">
                        {esc(l.detalles)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                            estadoBadge[l.estado] || "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          {estadoLabels[l.estado] || l.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-zinc-400">
                        {formatFecha(l.proxima_gestion)}
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => handleAbrirGestionar(l)}
                          className="flex items-center gap-1.5 rounded-xl border border-brand-red bg-transparent px-4 py-2 text-sm font-medium text-brand-red transition-all hover:bg-brand-red hover:text-white"
                        >
                          Gestionar
                          <IconChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards - mobile */}
            <div className="flex flex-col gap-3 md:hidden">
              {leads.map((l) => (
                <div
                  key={l.id}
                  onClick={() => handleAbrirGestionar(l)}
                  className="cursor-pointer rounded-2xl border border-zinc-200 bg-white p-3.5 transition-shadow active:shadow-md"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-[15px] font-semibold truncate" style={{ color: "#c12128" }}>
                        {esc(l.nombre)}
                      </div>
                      <div className="font-mono text-xs text-zinc-500">{esc(l.telefono)}</div>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        estadoBadge[l.estado] || "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {estadoLabels[l.estado] || l.estado}
                    </span>
                  </div>
                  <div className="mb-3 text-xs leading-relaxed text-zinc-400 line-clamp-2">
                    {esc(l.detalles) || "—"}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-300">
                      {l.proxima_gestion ? `📅 ${formatFecha(l.proxima_gestion)}` : "—"}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAbrirGestionar(l);
                      }}
                      className="flex items-center gap-1 rounded-xl border-0 bg-brand-red px-3.5 py-2.5 text-xs font-medium text-white min-h-[36px] active:scale-95 transition-transform"
                    >
                      Gestionar
                      <IconChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setNuevoOpen(true)}
        className="fixed bottom-5 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full border-0 text-white shadow-lg transition-transform active:scale-90 hover:shadow-xl md:bottom-6 md:right-6 md:h-15 md:w-15"
        style={{ background: "#c12128" }}
        aria-label="Nuevo Lead"
      >
        <IconPlus size={24} stroke={2.5} className="md:size-[28px]" />
      </button>

      {/* Modal: Nuevo Lead */}
      <Dialog open={nuevoOpen} onOpenChange={setNuevoOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl" style={{ color: "#c12128" }}>
              Nuevo Lead
            </DialogTitle>
            <DialogDescription>
              Ingresa los datos del nuevo cliente potencial.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 md:gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-600">Nombre</label>
              <input
                type="text"
                value={formNombre}
                onChange={(e) => setFormNombre(e.target.value)}
                placeholder="Nombre del cliente"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-red text-base md:text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-600">Teléfono</label>
              <input
                type="text"
                value={formTelefono}
                onChange={(e) => setFormTelefono(e.target.value)}
                placeholder="+52 555 123 4567"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-red text-base md:text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-600">Detalles</label>
              <textarea
                value={formDetalles}
                onChange={(e) => setFormDetalles(e.target.value)}
                rows={4}
                placeholder="Toda la información del lead..."
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-red text-base md:text-sm"
              />
            </div>
          </div>

          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
            <DialogClose render={<Button variant="outline" className="w-full sm:w-auto">Cancelar</Button>} />
            <Button onClick={handleGuardarNuevo} className="w-full sm:w-auto" style={{ background: "#c12128", color: "#fff" }}>
              Guardar Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Gestionar */}
      <Dialog open={gestionarOpen} onOpenChange={(v) => { setGestionarOpen(v); if (!v) setAccion(null); }}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl pr-6" style={{ color: "#c12128" }}>
              Gestionar: {esc(gestionandoLead?.nombre)}
            </DialogTitle>
          </DialogHeader>

          {/* Lead info */}
          {gestionandoLead && (
            <div className="mb-3 space-y-2 text-sm md:mb-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] font-medium text-zinc-400">Nombre</span>
                  <div className="font-semibold text-zinc-800 text-sm md:text-[15px]">{esc(gestionandoLead.nombre)}</div>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-zinc-400">Teléfono</span>
                  <div className="font-semibold text-zinc-800 text-sm md:text-[15px]">{esc(gestionandoLead.telefono)}</div>
                </div>
              </div>
              <div>
                <span className="text-[11px] font-medium text-zinc-400">Detalles</span>
                <div className="text-zinc-600 text-xs md:text-sm leading-relaxed">{esc(gestionandoLead.detalles) || "—"}</div>
              </div>
              <div className="grid grid-cols-3 gap-1 md:gap-2">
                <div>
                  <span className="text-[10px] font-medium text-zinc-400 md:text-[11px]">Estado</span>
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold md:text-[11px] ${
                        estadoBadge[gestionandoLead.estado] || "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {estadoLabels[gestionandoLead.estado] || gestionandoLead.estado}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-medium text-zinc-400 md:text-[11px]">Ingreso</span>
                  <div className="text-xs text-zinc-600 md:text-sm">
                    {formatFecha(gestionandoLead.fecha_ingreso)}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-medium text-zinc-400 md:text-[11px]">Próxima gestión</span>
                  <div className="text-xs text-zinc-600 md:text-sm">
                    {formatFecha(gestionandoLead.proxima_gestion)}
                  </div>
                </div>
              </div>
              {gestionandoLead.preferencia_reunion && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-2.5">
                  <span className="text-[11px] font-medium text-amber-700">Preferencia de reunión:</span>
                  <div className="font-semibold text-amber-900 text-sm">
                    {esc(gestionandoLead.preferencia_reunion)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action grid */}
          <div className="mb-3 grid grid-cols-2 gap-2 md:mb-4 md:gap-2.5">
            <button
              onClick={() => setAccion(accion === "llamar_despues" ? null : "llamar_despues")}
              className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3.5 text-center text-[11px] font-semibold leading-tight transition-all active:scale-95 min-h-[72px] md:p-4 md:text-xs ${
                accion === "llamar_despues"
                  ? "border-amber-400 bg-amber-50 text-amber-600"
                  : "border-zinc-200 bg-white text-zinc-500 hover:bg-amber-50/50"
              }`}
            >
              <IconClock size={22} className={accion === "llamar_despues" ? "text-amber-500" : "text-zinc-400 md:size-[24px]"} />
              Llamar después
            </button>
            <button
              onClick={handleNoInteresado}
              className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3.5 text-center text-[11px] font-semibold leading-tight transition-all active:scale-95 min-h-[72px] md:p-4 md:text-xs ${
                "border-zinc-200 bg-white text-zinc-500 hover:bg-red-50/50"
              }`}
            >
              <IconUserX size={22} className="text-zinc-400 md:size-[24px]" />
              No interesado
            </button>
            <button
              onClick={() => setAccion(accion === "reunion_virtual" ? null : "reunion_virtual")}
              className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3.5 text-center text-[11px] font-semibold leading-tight transition-all active:scale-95 min-h-[72px] md:p-4 md:text-xs ${
                accion === "reunion_virtual"
                  ? "border-emerald-400 bg-emerald-50 text-emerald-600"
                  : "border-zinc-200 bg-white text-zinc-500 hover:bg-emerald-50/50"
              }`}
            >
              <IconVideo size={22} className={accion === "reunion_virtual" ? "text-emerald-500" : "text-zinc-400 md:size-[24px]"} />
              Quiere reunión virtual
            </button>
            <button
              onClick={() => setAccion(accion === "agregar_nota" ? null : "agregar_nota")}
              className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3.5 text-center text-[11px] font-semibold leading-tight transition-all active:scale-95 min-h-[72px] md:p-4 md:text-xs ${
                accion === "agregar_nota"
                  ? "border-zinc-400 bg-zinc-50 text-zinc-600"
                  : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50"
              }`}
            >
              <IconMessage size={22} className={accion === "agregar_nota" ? "text-zinc-500" : "text-zinc-400 md:size-[24px]"} />
              Agregar nota
            </button>
          </div>

          {/* Extra input area */}
          {accion === "llamar_despues" && (
            <div className="mb-3 md:mb-4">
              <label className="mb-1.5 block text-xs font-semibold text-zinc-600">
                Fecha de próxima gestión
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="date"
                  value={inputProximaGestion}
                  onChange={(e) => setInputProximaGestion(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-400 sm:flex-1 text-base md:text-sm"
                />
                <Button
                  onClick={handleConfirmarLlamarDespues}
                  className="w-full font-semibold text-white sm:w-auto"
                  style={{ background: "#D69E2E" }}
                >
                  Guardar
                </Button>
              </div>
            </div>
          )}

          {accion === "reunion_virtual" && (
            <div className="mb-3 md:mb-4">
              <label className="mb-1.5 block text-xs font-semibold text-zinc-600">
                Preferencia de día/hora del cliente <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={inputPreferencia}
                  onChange={(e) => setInputPreferencia(e.target.value)}
                  placeholder="Ej: Jueves 10 am por Google Meet"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-400 sm:flex-1 text-base md:text-sm"
                />
                <Button
                  onClick={handleConfirmarReunionVirtual}
                  className="w-full font-semibold text-white sm:w-auto"
        style={{ background: "#c12128" }}
                >
                  Guardar
                </Button>
              </div>
            </div>
          )}

          {accion === "agregar_nota" && (
            <div className="mb-3 md:mb-4">
              <label className="mb-1.5 block text-xs font-semibold text-zinc-600">
                Nota / comentario
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <textarea
                  value={inputNota}
                  onChange={(e) => setInputNota(e.target.value)}
                  rows={3}
                  placeholder="Escribe un comentario..."
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-400 sm:flex-1 text-base md:text-sm"
                />
                <Button onClick={handleConfirmarNota} variant="secondary" className="w-full font-semibold sm:w-auto sm:self-start">
                  Guardar
                </Button>
              </div>
            </div>
          )}

          {/* History section */}
          <div className="border-t border-zinc-100 pt-3 md:pt-4">
            <h6 className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-300 md:text-xs">
              <IconClock size={13} className="md:size-[14px]" />
              Historial de seguimiento
            </h6>
            {seguimientos.length === 0 ? (
              <p className="text-xs text-zinc-300">Sin seguimientos registrados.</p>
            ) : (
              <div className="relative space-y-0">
                {seguimientos.map((s, i) => (
                  <div key={s.id} className="relative pl-5 pb-3 last:pb-0 md:pb-3.5">
                    <div className="absolute left-[7px] top-[7px] h-2 w-2 rounded-full" style={{ background: "#c12128" }} />
                    {i < seguimientos.length - 1 && (
                      <div className="absolute left-[10.5px] top-[18px] bottom-0 w-px bg-zinc-200" />
                    )}
                    <div className="font-mono text-[10px] text-zinc-300 md:text-[11px]">{formatFechaHora(s.fecha_hora)}</div>
                    <div className="text-xs text-zinc-600 leading-relaxed md:text-sm">{esc(s.nota)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" className="w-full sm:w-auto">Cerrar</Button>} />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
