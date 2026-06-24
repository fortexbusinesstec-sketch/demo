"use client";

import { memo, useState } from "react";
import {
  IconBuildingFactory,
  IconBuilding,
  IconHammer,
  IconTools,
  IconHome,
  IconBuildingStore,
  IconClipboardCheck,
  IconMapPin,
  IconPhone,
  IconMail,
  IconUser,
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { ClienteRow } from "../actions";
import { cn } from "@/lib/utils";

const iconMap: Record<string, typeof IconBuildingFactory> = {
  EPS: IconBuildingFactory,
  "Gerencia Regional": IconBuilding,
  Constructora: IconHammer,
  Ferretería: IconTools,
  Inmobiliaria: IconHome,
  Otro: IconBuildingStore,
};

const estadoColor: Record<string, string> = {
  "Por visitar": "bg-slate-100 text-slate-800 border-slate-200",
  Visitado: "bg-sky-100 text-sky-800 border-sky-200",
  "Cotización enviada": "bg-amber-100 text-amber-800 border-amber-200",
  Negociación: "bg-orange-100 text-orange-800 border-orange-200",
  Cerrado: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Rechazado: "bg-red-100 text-red-800 border-red-200",
};

const estadoBg: Record<string, string> = {
  "Por visitar": "",
  Visitado: "bg-zinc-50",
  "Cotización enviada": "bg-amber-50/40",
  Negociación: "bg-orange-50/40",
  Cerrado: "bg-emerald-50/40",
  Rechazado: "bg-red-50/40",
};

export const ClienteCard = memo(function ClienteCard({
  cliente,
  onRegistrarVisita,
}: {
  cliente: ClienteRow;
  onRegistrarVisita: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const Icon = iconMap[cliente.tipo_cliente] || IconBuildingStore;
  const badgeColor = estadoColor[cliente.estado] || "";
  const cardBg = estadoBg[cliente.estado] || "";

  return (
    <>
      <Card
        className={cn("flex flex-row items-center gap-3 py-4 px-2.5 cursor-pointer transition-colors hover:bg-zinc-50", cardBg)}
        onClick={() => setDialogOpen(true)}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
          <Icon size={22} />
        </div>

        <h3 className="flex-1 text-base font-semibold text-zinc-900 leading-tight">
          {cliente.nombre_entidad}
        </h3>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <Badge variant="outline" className={badgeColor}>{cliente.estado}</Badge>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRegistrarVisita(); }}
            className="flex h-9 items-center gap-1 rounded-full bg-sky-500 px-3.5 text-xs font-semibold text-white transition-colors hover:bg-sky-600 active:bg-sky-700"
          >
            <IconClipboardCheck size={15} />
            Registrar
          </button>
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[85dvh] !gap-0 !p-0 min-h-0">
          <div className="shrink-0 px-4 pt-4">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-zinc-900">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                <Icon size={18} />
              </div>
              {cliente.nombre_entidad}
            </DialogTitle>
          </div>

          <div className="overflow-y-auto min-h-0 space-y-3 px-4 pb-4">
            {cliente.direccion && (
              <div className="flex items-start gap-2">
                <IconMapPin size={18} className="mt-0.5 shrink-0 text-zinc-400" />
                <div>
                  <p className="text-xs font-medium text-zinc-500">Dirección</p>
                  <p className="text-sm text-zinc-900">{cliente.direccion}</p>
                  {cliente.distrito && (
                    <p className="text-xs text-zinc-500">{cliente.distrito}</p>
                  )}
                </div>
              </div>
            )}
            {cliente.telefono && (
              <div className="flex items-start gap-2">
                <IconPhone size={18} className="mt-0.5 shrink-0 text-zinc-400" />
                <div>
                  <p className="text-xs font-medium text-zinc-500">Teléfono</p>
                  <a href={`tel:${cliente.telefono}`} className="text-sm text-sky-600 hover:underline">
                    {cliente.telefono}
                  </a>
                </div>
              </div>
            )}
            {cliente.email && (
              <div className="flex items-start gap-2">
                <IconMail size={18} className="mt-0.5 shrink-0 text-zinc-400" />
                <div>
                  <p className="text-xs font-medium text-zinc-500">Email</p>
                  <a href={`mailto:${cliente.email}`} className="text-sm text-sky-600 hover:underline">
                    {cliente.email}
                  </a>
                </div>
              </div>
            )}
            {cliente.contacto_clave && (
              <div className="flex items-start gap-2">
                <IconUser size={18} className="mt-0.5 shrink-0 text-zinc-400" />
                <div>
                  <p className="text-xs font-medium text-zinc-500">Contacto clave</p>
                  <p className="text-sm text-zinc-900">
                    {cliente.contacto_clave}
                    {cliente.cargo_contacto && ` — ${cliente.cargo_contacto}`}
                  </p>
                </div>
              </div>
            )}
            {cliente.referencia && (
              <p className="text-xs italic text-zinc-400">Ref: {cliente.referencia}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});
