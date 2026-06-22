"use client";

import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import {
  IconDroplet,
  IconArrowLeft,
  IconBuildingFactory,
  IconBuilding,
  IconHammer,
  IconTools,
  IconHome,
  IconBuildingStore,
  IconPlus,
} from "@tabler/icons-react";
import { CiudadCard } from "./components/CiudadCard";
import { ClienteCard } from "./components/ClienteCard";
import type { ClienteRow, ConteoCiudad } from "./actions";
import { cn } from "@/lib/utils";

const VisitaSheet = lazy(() =>
  import("./components/VisitaSheet").then((m) => ({ default: m.VisitaSheet }))
);
const CrearClienteSheet = lazy(() =>
  import("./components/CrearClienteSheet").then((m) => ({ default: m.CrearClienteSheet }))
);

import { getAllConteos, getClientesByCiudadAndTipo } from "./actions";

type Screen = "dashboard" | "ciudad";

const tipoClienteList = [
  { key: "EPS", icon: IconBuildingFactory },
  { key: "Gerencia Regional", icon: IconBuilding },
  { key: "Constructora", icon: IconHammer },
  { key: "Ferretería", icon: IconTools },
  { key: "Inmobiliaria", icon: IconHome },
  { key: "Otro", icon: IconBuildingStore },
];

export default function VentaPage() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState<string>("");
  const [conteos, setConteos] = useState<ConteoCiudad[]>([]);
  const [clientes, setClientes] = useState<ClienteRow[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [clienteSheet, setClienteSheet] = useState<ClienteRow | null>(null);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [crearSheetOpen, setCrearSheetOpen] = useState(false);
  const [clienteEditar, setClienteEditar] = useState<ClienteRow | null>(null);
  const [filtrosOpen, setFiltrosOpen] = useState(false);

  useEffect(() => {
    getAllConteos().then(setConteos);
  }, []);

  const loadClientes = useCallback(
    async (ciudad: string, tipo: string | null) => {
      setLoadingClientes(true);
      const data = await getClientesByCiudadAndTipo(ciudad, tipo);
      setClientes(data);
      setLoadingClientes(false);
    },
    []
  );

  const refreshConteos = useCallback(() => {
    getAllConteos().then(setConteos);
  }, []);

  const handleSelectCiudad = useCallback((ciudad: string) => {
    setCiudadSeleccionada(ciudad);
    setFiltroTipo(null);
    setScreen("ciudad");
    getClientesByCiudadAndTipo(ciudad, null).then((data) => {
      setClientes(data);
    });
  }, []);

  const handleFiltroTipo = useCallback(
    (tipo: string | null) => {
      setFiltroTipo(tipo);
      loadClientes(ciudadSeleccionada, tipo);
    },
    [ciudadSeleccionada, loadClientes]
  );

  const handleBack = useCallback(() => {
    setScreen("dashboard");
    setCiudadSeleccionada("");
    setClientes([]);
    setFiltroTipo(null);
  }, []);

  const handleRegistrarVisita = useCallback((cliente: ClienteRow) => {
    setClienteSheet(cliente);
    setSheetOpen(true);
  }, []);

  const handleVisitaSuccess = useCallback(() => {
    loadClientes(ciudadSeleccionada, filtroTipo);
    refreshConteos();
  }, [ciudadSeleccionada, filtroTipo, loadClientes, refreshConteos]);

  const handleEditarCliente = useCallback((cliente: ClienteRow) => {
    setClienteEditar(cliente);
    setCrearSheetOpen(true);
  }, []);

  const handleCrearClienteSuccess = useCallback(() => {
    refreshConteos();
    if (screen === "ciudad") {
      loadClientes(ciudadSeleccionada, filtroTipo);
    }
  }, [screen, ciudadSeleccionada, filtroTipo, loadClientes, refreshConteos]);

  const getConteo = useCallback(
    (ciudad: string) => {
      const c = conteos.find((c) => c.ciudad === ciudad);
      return c ? c.por_visitar : 0;
    },
    [conteos]
  );

  const handleCrearOpen = useCallback(() => {
    setClienteEditar(null);
    setCrearSheetOpen(true);
  }, []);

  const handleCrearSheetChange = useCallback((open: boolean) => {
    setCrearSheetOpen(open);
    if (!open) setClienteEditar(null);
  }, []);

  const handleVisitaSheetChange = useCallback((open: boolean) => {
    setSheetOpen(open);
  }, []);

  const handleEditarFromVisita = useCallback((cliente: ClienteRow) => {
    setClienteEditar(cliente);
    setCrearSheetOpen(true);
  }, []);

  if (screen === "ciudad") {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col bg-white px-4 py-3 md:px-8">
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors"
          >
            <IconArrowLeft size={22} />
          </button>
          <h1 className="flex-1 text-xl font-bold text-zinc-900 md:text-2xl">{ciudadSeleccionada}</h1>
          <button
            type="button"
            onClick={handleCrearOpen}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-white hover:bg-sky-600 transition-colors"
          >
            <IconPlus size={22} />
          </button>
        </div>

        <div className="mb-4 relative">
          <div className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible">
            <button
              type="button"
              onClick={() => handleFiltroTipo(null)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
                filtroTipo === null
                  ? "border-sky-500 bg-sky-500 text-white"
                  : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
              )}
            >
              Todos
            </button>
            {tipoClienteList.slice(0, 3).map((t) => {
              const Icon = t.icon;
              const active = filtroTipo === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => handleFiltroTipo(t.key)}
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
                    active
                      ? "border-sky-500 bg-sky-500 text-white"
                      : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                  )}
                >
                  <Icon size={16} className="inline mr-1 align-text-bottom" />
                  {t.key}
                </button>
              );
            })}
            <div className="relative shrink-0 md:hidden">
              <button
                type="button"
                onClick={() => setFiltrosOpen(!filtrosOpen)}
                className="shrink-0 rounded-full border border-dashed border-zinc-400 px-3 py-1.5 text-sm font-medium text-zinc-500 hover:bg-zinc-50 transition-colors whitespace-nowrap"
              >
                +{tipoClienteList.length - 3} más
              </button>
              {filtrosOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setFiltrosOpen(false)} />
                  <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg">
                    {tipoClienteList.slice(3).map((t) => {
                      const Icon = t.icon;
                      const active = filtroTipo === t.key;
                      return (
                        <button
                          key={t.key}
                          type="button"
                          onClick={() => { handleFiltroTipo(t.key); setFiltrosOpen(false); }}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            active
                              ? "bg-sky-50 text-sky-700"
                              : "text-zinc-700 hover:bg-zinc-50"
                          )}
                        >
                          <Icon size={16} />
                          {t.key}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
            <div className="hidden md:flex md:gap-2">
              {tipoClienteList.slice(3).map((t) => {
                const Icon = t.icon;
                const active = filtroTipo === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => handleFiltroTipo(t.key)}
                    className={cn(
                      "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
                      active
                        ? "border-sky-500 bg-sky-500 text-white"
                        : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                    )}
                  >
                    <Icon size={16} className="inline mr-1 align-text-bottom" />
                    {t.key}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-3">
          {loadingClientes ? (
            <p className="col-span-full py-8 text-center text-sm text-zinc-400">Cargando...</p>
          ) : clientes.length === 0 ? (
            <p className="col-span-full py-8 text-center text-sm text-zinc-400">
              No hay clientes en esta ciudad
            </p>
          ) : (
            clientes.map((cliente) => (
              <ClienteCard
                key={cliente.id}
                cliente={cliente}
                onRegistrarVisita={() => handleRegistrarVisita(cliente)}
              />
            ))
          )}
        </div>

        <Suspense fallback={null}>
          <VisitaSheet
            open={sheetOpen}
            onOpenChange={handleVisitaSheetChange}
            cliente={clienteSheet}
            onSuccess={handleVisitaSuccess}
            onEditarCliente={handleEditarFromVisita}
          />
        </Suspense>

        <Suspense fallback={null}>
          <CrearClienteSheet
            key={clienteEditar?.id ?? "new"}
            open={crearSheetOpen}
            onOpenChange={handleCrearSheetChange}
            onSuccess={handleCrearClienteSuccess}
            cliente={clienteEditar}
          />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col bg-white px-4 py-3 md:px-8 md:py-6">
      <div className="mb-4 flex items-center gap-3 md:mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 md:h-14 md:w-14">
          <IconDroplet size={26} className="text-sky-500 md:size-[30px]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-zinc-900 md:text-3xl">Medidores de Agua</h1>
          <p className="text-sm text-zinc-500 md:text-base">Henrry Díaz</p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 md:grid md:grid-cols-3 md:gap-4">
        {["Chiclayo", "Trujillo", "Chimbote"].map((ciudad) => (
          <CiudadCard
            key={ciudad}
            nombre={ciudad}
            conteo={getConteo(ciudad)}
            onSelect={() => handleSelectCiudad(ciudad)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={handleCrearOpen}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg transition-all hover:bg-sky-600 active:scale-95 md:bottom-8 md:right-8"
      >
        <IconPlus size={28} />
      </button>

      <Suspense fallback={null}>
        <CrearClienteSheet
          key={clienteEditar?.id ?? "new"}
          open={crearSheetOpen}
          onOpenChange={handleCrearSheetChange}
          onSuccess={handleCrearClienteSuccess}
          cliente={clienteEditar}
        />
      </Suspense>
    </div>
  );
}
