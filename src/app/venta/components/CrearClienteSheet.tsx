"use client";

import { useState } from "react";
import {
  IconX,
  IconBuildingWarehouse,
  IconBuildingSkyscraper,
  IconAnchor,
  IconMapPin,
  IconDeviceFloppy,
  IconCheck,
  IconPencil,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useGeolocation } from "../hooks/useGeolocation";
import { crearCliente, actualizarCliente, type ClienteRow } from "../actions";
import { cn } from "@/lib/utils";

const ciudades = [
  { value: "Chiclayo", icon: IconBuildingWarehouse },
  { value: "Trujillo", icon: IconBuildingSkyscraper },
  { value: "Chimbote", icon: IconAnchor },
] as const;

const tiposCliente = [
  "EPS",
  "Gerencia Regional",
  "Constructora",
  "Ferretería",
  "Inmobiliaria",
  "Otro",
] as const;

const probabilidades = ["Alta", "Media", "Baja"] as const;
const volumenes = [">500", "50-200", "<50"] as const;

export function CrearClienteSheet({
  open,
  onOpenChange,
  onSuccess,
  cliente,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  cliente?: ClienteRow | null;
}) {
  const isEdit = !!cliente;

  const [ciudad, setCiudad] = useState(cliente?.ciudad ?? "");
  const [distrito, setDistrito] = useState(cliente?.distrito ?? "");
  const [tipoCliente, setTipoCliente] = useState(cliente?.tipo_cliente ?? "");
  const [nombreEntidad, setNombreEntidad] = useState(cliente?.nombre_entidad ?? "");
  const [direccion, setDireccion] = useState(cliente?.direccion ?? "");
  const [referencia, setReferencia] = useState(cliente?.referencia ?? "");
  const [telefono, setTelefono] = useState(cliente?.telefono ?? "");
  const [email, setEmail] = useState(cliente?.email ?? "");
  const [contactoClave, setContactoClave] = useState(cliente?.contacto_clave ?? "");
  const [cargoContacto, setCargoContacto] = useState(cliente?.cargo_contacto ?? "");
  const [probabilidad, setProbabilidad] = useState(cliente?.probabilidad ?? "");
  const [volumenEstimado, setVolumenEstimado] = useState(cliente?.volumen_estimado ?? "");
  const [observaciones, setObservaciones] = useState(cliente?.observaciones ?? "");
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const geo = useGeolocation();

  const resetForm = () => {
    setCiudad("");
    setDistrito("");
    setTipoCliente("");
    setNombreEntidad("");
    setDireccion("");
    setReferencia("");
    setTelefono("");
    setEmail("");
    setContactoClave("");
    setCargoContacto("");
    setProbabilidad("");
    setVolumenEstimado("");
    setObservaciones("");
    geo.resetLocation();
    setGuardando(false);
    setGuardado(false);
  };

  const handleGuardar = async () => {
    if (!ciudad || !tipoCliente || !nombreEntidad.trim()) return;
    setGuardando(true);
    try {
      const payload = {
        ciudad,
        distrito: distrito || null,
        tipo_cliente: tipoCliente,
        nombre_entidad: nombreEntidad.trim(),
        direccion: direccion || null,
        referencia: referencia || null,
        telefono: telefono || null,
        email: email || null,
        contacto_clave: contactoClave || null,
        cargo_contacto: cargoContacto || null,
        probabilidad: probabilidad || null,
        volumen_estimado: volumenEstimado || null,
        lat: geo.lat?.toString() ?? null,
        lng: geo.lng?.toString() ?? null,
        observaciones: observaciones || null,
      };
      if (isEdit && cliente) {
        await actualizarCliente(cliente.id, payload);
      } else {
        await crearCliente(payload);
      }
      setGuardado(true);
      setTimeout(() => {
        resetForm();
        onOpenChange(false);
        onSuccess();
      }, 1200);
    } catch {
      setGuardando(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  if (guardado) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <IconCheck size={32} className="text-emerald-600" />
            </div>
            <p className="mt-4 text-lg font-semibold text-zinc-900">
              {isEdit ? "Cliente actualizado" : "Cliente creado"}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {isEdit ? "Los cambios se guardaron correctamente" : "Se ha agregado correctamente"}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const inputCls =
    "w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {isEdit && <IconPencil size={18} className="text-zinc-500" />}
            <DialogTitle>{isEdit ? "Editar Cliente" : "Nuevo Cliente Potencial"}</DialogTitle>
          </div>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-1.5 text-xs font-semibold text-zinc-600 uppercase tracking-wide">Ciudad *</p>
            <div className="grid grid-cols-3 gap-2">
              {ciudades.map((c) => {
                const Icon = c.icon;
                const active = ciudad === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCiudad(c.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl border-2 p-2.5 text-xs font-medium transition-all",
                      active
                        ? "border-sky-500 bg-sky-50 text-sky-700"
                        : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                    )}
                  >
                    <Icon size={18} />
                    {c.value}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold text-zinc-600 uppercase tracking-wide">Tipo de Cliente *</p>
            <div className="grid grid-cols-2 gap-2">
              {tiposCliente.map((t) => {
                const active = tipoCliente === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipoCliente(t)}
                    className={cn(
                      "rounded-xl border-2 px-3 py-2.5 text-xs font-medium transition-all",
                      active
                        ? "border-sky-500 bg-sky-50 text-sky-700"
                        : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                    )}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold text-zinc-600 uppercase tracking-wide">Nombre de la Entidad *</p>
            <input
              className={inputCls}
              placeholder="Ej: Municipalidad de Chiclayo"
              value={nombreEntidad}
              onChange={(e) => setNombreEntidad(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-1.5 text-xs font-semibold text-zinc-600 uppercase tracking-wide">Distrito</p>
              <input className={inputCls} placeholder="Distrito" value={distrito} onChange={(e) => setDistrito(e.target.value)} />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold text-zinc-600 uppercase tracking-wide">Referencia</p>
              <input className={inputCls} placeholder="Referencia" value={referencia} onChange={(e) => setReferencia(e.target.value)} />
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold text-zinc-600 uppercase tracking-wide">Dirección</p>
            <input className={inputCls} placeholder="Av. / Jr. / Calle" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-1.5 text-xs font-semibold text-zinc-600 uppercase tracking-wide">Teléfono</p>
              <input className={inputCls} placeholder="999 999 999" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold text-zinc-600 uppercase tracking-wide">Email</p>
              <input className={inputCls} placeholder="correo@ejemplo.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-1.5 text-xs font-semibold text-zinc-600 uppercase tracking-wide">Contacto Clave</p>
              <input className={inputCls} placeholder="Nombre" value={contactoClave} onChange={(e) => setContactoClave(e.target.value)} />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold text-zinc-600 uppercase tracking-wide">Cargo</p>
              <input className={inputCls} placeholder="Gerente" value={cargoContacto} onChange={(e) => setCargoContacto(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-1.5 text-xs font-semibold text-zinc-600 uppercase tracking-wide">Probabilidad</p>
              <div className="flex gap-2">
                {probabilidades.map((p) => {
                  const active = probabilidad === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setProbabilidad(active ? "" : p)}
                      className={cn(
                        "flex-1 rounded-xl border-2 py-2 text-xs font-medium transition-all",
                        active ? "border-sky-500 bg-sky-50 text-sky-700" : "border-zinc-200 bg-white text-zinc-500"
                      )}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold text-zinc-600 uppercase tracking-wide">Vol. Estimado</p>
              <div className="flex gap-2">
                {volumenes.map((v) => {
                  const active = volumenEstimado === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setVolumenEstimado(active ? "" : v)}
                      className={cn(
                        "flex-1 rounded-xl border-2 py-2 text-xs font-medium transition-all",
                        active ? "border-sky-500 bg-sky-50 text-sky-700" : "border-zinc-200 bg-white text-zinc-500"
                      )}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

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
                Ver mapa
              </a>
            )}
          </div>
          {geo.lat && geo.lng && (
            <p className="-mt-2 text-center text-xs text-zinc-400">{geo.lat.toFixed(6)}, {geo.lng.toFixed(6)}</p>
          )}
          {geo.error && <p className="-mt-2 text-center text-xs text-red-500">{geo.error}</p>}

          <div>
            <p className="mb-1.5 text-xs font-semibold text-zinc-600 uppercase tracking-wide">Observaciones</p>
            <Textarea
              placeholder="Notas adicionales..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </div>

          <Button
            type="button"
            variant="default"
            className="w-full h-14 text-base"
            onClick={handleGuardar}
            disabled={!ciudad || !tipoCliente || !nombreEntidad.trim() || guardando}
          >
            {guardando ? (
              "Guardando..."
            ) : (
              <>
                <IconDeviceFloppy size={18} />
                {isEdit ? "Actualizar Cliente" : "Guardar Cliente"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
