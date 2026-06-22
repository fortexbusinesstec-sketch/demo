"use client";

import { useState, useCallback } from "react";

type GeolocationState = {
  loading: boolean;
  lat: number | null;
  lng: number | null;
  error: string | null;
};

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    loading: false,
    lat: null,
    lng: null,
    error: null,
  });

  const captureLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: "Geolocalización no soportada" }));
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          loading: false,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          error: null,
        });
      },
      (err) => {
        let msg = "Error al obtener ubicación";
        if (err.code === 1) msg = "Permiso denegado";
        else if (err.code === 2) msg = "Ubicación no disponible";
        else if (err.code === 3) msg = "Tiempo de espera agotado";
        setState({ loading: false, lat: null, lng: null, error: msg });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const resetLocation = useCallback(() => {
    setState({ loading: false, lat: null, lng: null, error: null });
  }, []);

  return { ...state, captureLocation, resetLocation };
}
