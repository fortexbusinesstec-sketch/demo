"use client";

import { useState } from "react";
import {
  IconMapPin,
  IconThumbUp,
  IconFileInvoice,
  IconThumbDown,
  IconClock,
  IconCoin,
  IconDeviceFloppy,
  IconCheck,
  IconPhone,
  IconMap,
  IconUser,
  IconBuildingStore,
  IconMail,
  IconPencil,
  IconMap2,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useGeolocation } from "../hooks/useGeolocation";
import { crearVisita, type ClienteRow } from "../actions";
import { cn } from "@/lib/utils";

type ResultadoKey = "Interesado" | "Cotización" | "No interesado" | "Seguimiento" | "Cerrado";

const resultados: { key: ResultadoKey; label: string; icon: typeof IconThumbUp; colors: string; activeColors: string }[] = [
  { key: "Interesado", label: "Interesado", icon: IconThumbUp, colors: "border-emerald-200 bg-emerald-50 text-emerald-700", activeColors: "border-emerald-500 bg-emerald-500 text-white" },
  { key: "Cotización", label: "Cotización", icon: IconFileInvoice, colors: "border-amber-200 bg-amber-50 text-amber-700", activeColors: "border-amber-500 bg-amber-500 text-white" },
  { key: "No interesado", label: "No interesado", icon: IconThumbDown, colors: "border-red-200 bg-red-50 text-red-700", activeColors: "border-red-500 bg-red-500 text-white" },
  { key: "Seguimiento", label: "Seguimiento", icon: IconClock, colors: "border-blue-200 bg-blue-50 text-blue-700", activeColors: "border-blue-500 bg-blue-500 text-white" },
  { key: "Cerrado", label: "Cerrado", icon: IconCoin, colors: "border-emerald-200 bg-emerald-50 text-emerald-700", activeColors: "border-emerald-600 bg-emerald-600 text-white" },
];

export function VisitaSheet({
  open,
  onOpenChange,
  cliente,
  onSuccess,
  onEditarCliente,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: ClienteRow | null;
  onSuccess: () => void;
  onEditarCliente: (cliente: ClienteRow) => void;
}) {
  const [resultado, setResultado] = useState<ResultadoKey | null>(null);
  const [notas, setNotas] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const geo = useGeolocation();

  const resetForm = () => {
    setResultado(null);
    setNotas("");
    geo.resetLocation();
    setSaving(false);
    setSaved(false);
    setError(null);
  };

  const handleSave = async () => {
    if (!cliente || !resultado) return;
    setSaving(true);
    try {
      await crearVisita({
        cliente_id: cliente.id,
        resultado,
        notas: notas || null,
        lat: geo.lat,
        lng: geo.lng,
      });
      setSaved(true);
      setTimeout(() => {
        resetForm();
        onOpenChange(false);
        onSuccess();
      }, 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar la visita");
      setSaving(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  if (saved) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Registrar Visita</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <IconCheck size={32} className="text-emerald-600" />
            </div>
            <p className="mt-4 text-lg font-semibold text-zinc-900">Visita guardada</p>
            <p className="mt-1 text-sm text-zinc-500">El registro se ha creado correctamente</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[85dvh] !gap-0 !p-0 min-h-0 grid-rows-[auto_minmax(0,1fr)_auto]">
        <DialogHeader className="shrink-0 px-4 pt-4">
          <div>
            <DialogTitle>Registrar Visita</DialogTitle>
            {cliente && <DialogDescription className="break-words">{cliente.nombre_entidad}</DialogDescription>}
          </div>
        </DialogHeader>
        <div className="flex flex-col gap-4 overflow-y-auto min-h-0 px-4 pb-4">
          {cliente && (
            <div className="rounded-xl bg-sky-50 border border-sky-100 p-3">
              <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-sky-100">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                    <IconBuildingStore size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 break-words">{cliente.nombre_entidad}</p>
                    <p className="text-xs text-zinc-500">{cliente.tipo_cliente} · {cliente.ciudad}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { onOpenChange(false); onEditarCliente(cliente); }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white border border-zinc-200 text-zinc-400 hover:text-sky-600 hover:border-sky-300 transition-colors"
                >
                  <IconPencil size={14} />
                </button>
              </div>
              <div className="space-y-1 text-xs">
                {cliente.direccion && (
                  <div className="flex items-center gap-1.5 text-zinc-600">
                    <IconMap size={12} className="shrink-0 text-sky-500" />
                    <span className="truncate">{cliente.direccion}</span>
                  </div>
                )}
                {cliente.telefono && (
                  <div className="flex items-center gap-1.5 text-zinc-600">
                    <IconPhone size={12} className="shrink-0 text-sky-500" />
                    <span>{cliente.telefono}</span>
                  </div>
                )}
                {cliente.email && (
                  <div className="flex items-center gap-1.5 text-zinc-600">
                    <IconMail size={12} className="shrink-0 text-sky-500" />
                    <span className="truncate">{cliente.email}</span>
                  </div>
                )}
                {cliente.contacto_clave && (
                  <div className="flex items-center gap-1.5 text-zinc-600">
                    <IconUser size={12} className="shrink-0 text-sky-500" />
                    <span className="truncate">
                      {cliente.contacto_clave}{cliente.cargo_contacto ? ` (${cliente.cargo_contacto})` : ""}
                    </span>
                  </div>
                )}
                {(cliente.lat && cliente.lng) ? (
                  <a
                    href={`https://www.google.com/maps?q=${cliente.lat},${cliente.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sky-600 hover:text-sky-700 font-medium"
                  >
                    <IconMap2 size={12} />
                    Ver ubicación en Google Maps
                  </a>
                ) : null}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={geo.captureLocation}
              disabled={geo.loading}
            >
              <IconMapPin size={16} className="text-red-500" />
              {geo.loading ? "Obteniendo..." : "GPS"}
            </Button>
            {geo.lat && geo.lng && (
              <a
                href={`https://www.google.com/maps?q=${geo.lat},${geo.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-500 hover:bg-zinc-50"
              >
                <IconMap2 size={14} />
                Mapa
              </a>
            )}
          </div>
          {geo.lat && geo.lng && (
            <p className="-mt-2 text-center text-xs text-zinc-400">{geo.lat.toFixed(6)}, {geo.lng.toFixed(6)}</p>
          )}
          {geo.error && <p className="-mt-2 text-center text-xs text-red-500">{geo.error}</p>}

          <div>
            <p className="mb-2 text-xs font-semibold text-zinc-600 uppercase tracking-wide">Resultado de la visita</p>
            <div className="grid grid-cols-2 gap-2">
              {resultados.map((r) => {
                const Icon = r.icon;
                const active = resultado === r.key;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setResultado(r.key)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-xl border-2 p-2.5 text-xs font-medium transition-all min-h-[48px]",
                      active ? r.activeColors : r.colors
                    )}
                  >
                    <Icon size={16} />
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-zinc-600 uppercase tracking-wide">Notas</p>
            <Textarea
              placeholder="¿Qué conversaste? ¿Qué necesita el cliente?"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

        </div>

        {error && (
          <div className="shrink-0 px-4 pb-2">
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          </div>
        )}
        <div className="shrink-0 border-t border-zinc-200 px-4 pb-4 pt-3">
          <Button
            type="button"
            variant="default"
            className="w-full h-14 text-base"
            onClick={handleSave}
            disabled={!resultado || saving}
          >
            {saving ? "Guardando..." : <><IconDeviceFloppy size={18} /> Guardar Visita</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
