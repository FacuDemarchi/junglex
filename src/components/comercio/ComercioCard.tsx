import React, { useState, useRef, useEffect, ChangeEvent, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import supabase from "../../supabase/supabase.config";
import GoogleMapWrapper from "../common/GoogleMapWrapper";
import { useGoogleMaps } from "../../context/GoogleMapsContext";

export interface Comercio {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  categorias: string;
  logo: string;
  latitude: number;
  longitude: number;
  horario_apertura: string;
  horario_cierre: string;
}

interface ComercioCardProps {
  comercio: Comercio;
  onUpdate?: (comercio: Comercio) => void;
}

const Marker: React.FC<{ lat?: number; lng?: number; text: string }> = ({ text }) => <div>{text}</div>;

const ComercioCard: React.FC<ComercioCardProps> = ({ comercio, onUpdate }) => {
  const [values, setValues] = useState<Comercio>({ ...comercio });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Mapa y dirección (con ref y autocomplete nativo)
  const [address, setAddress] = useState<string>(comercio.direccion || '');
  const [position, setPosition] = useState<{ lat: number; lng: number }>({ lat: comercio.latitude, lng: comercio.longitude });
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autoCompleteRef = useRef<any>(null);
  const { isLoaded: googleReady } = useGoogleMaps();

  useEffect(() => {
    setValues({ ...comercio });
    setAddress(comercio.direccion || '');
    setPosition({ lat: comercio.latitude, lng: comercio.longitude });
  }, [comercio]);

  // Inicializa el autocomplete nativo de Google Maps como en UserLocationForm
  useEffect(() => {
    if (inputRef.current && googleReady && window.google?.maps?.places) {
      autoCompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current);
      autoCompleteRef.current.addListener('place_changed', () => {
        const place = autoCompleteRef.current.getPlace();
        if (place && place.geometry) {
          const location = place.geometry.location;
          const newPosition = {
            lat: location.lat(),
            lng: location.lng(),
          };
          setPosition(newPosition);
          setAddress(place.formatted_address || place.name);
        }
      });
    }
  }, [inputRef, googleReady]);

  // Detecta si hay cambios respecto al comercio original
  const hasChanges = Object.keys(values).some(
    (key) => (values as any)[key] !== (comercio as any)[key]
  ) || address !== comercio.direccion || position.lat !== comercio.latitude || position.lng !== comercio.longitude;

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("comercios")
        .update({
          nombre: values.nombre,
          direccion: address,
          telefono: values.telefono,
          categorias: values.categorias,
          horario_apertura: values.horario_apertura,
          horario_cierre: values.horario_cierre,
          latitude: position.lat,
          longitude: position.lng,
        })
        .eq("id", comercio.id);
      if (error) throw error;
      if (onUpdate && data && data[0]) onUpdate(data[0]);
    } catch (error: any) {
      console.error("Error al guardar los cambios:", error.message);
      setError("No se pudo guardar los cambios.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setValues({ ...comercio });
    setAddress(comercio.direccion || '');
    setPosition({ lat: comercio.latitude, lng: comercio.longitude });
  };

  const handleChange = (field: keyof Comercio, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  // Actualizar la posición cuando se mueve el mapa
  const handleMapChange = useCallback(({ center }: { center: { lat: number; lng: number } }) => {
    setPosition({ lat: center.lat, lng: center.lng });
  }, []);

  const handleLogoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setLoading(true);
        const fileExt = file.name.split(".").pop();
        const fileName = `${comercio.id}_logo.${fileExt}`;
        const filePath = `logos/${fileName}`;

        await supabase.storage
          .from("comercios")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
          });

        const { data } = supabase.storage.from("comercios").getPublicUrl(filePath);

        await supabase
          .from("comercios")
          .update({ logo: data.publicUrl })
          .eq("id", comercio.id);

        if (onUpdate) onUpdate({ ...comercio, logo: data.publicUrl });

        setLoading(false);
      } catch (error: any) {
        console.error("Error al cargar el logo:", error.message);
        setError("No se pudo cargar el logo.");
        setLoading(false);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full bg-white rounded-xl shadow p-4 md:p-6 flex flex-col md:flex-row gap-6 items-start">
      {/* Info principal y formulario */}
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex flex-col md:flex-row gap-4 items-start">
          {/* Logo */}
          <div className="flex flex-col items-center gap-2 w-full md:w-auto">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLogoChange}
              accept="image/*"
              style={{ display: "none" }}
              disabled={loading}
            />
            <img
              src={comercio.logo || "https://afuwvuyeqclmmqbryjwr.supabase.co/storage/v1/object/public/comercios//default_comerce.jpeg"}
              alt={`${comercio.nombre} logo`}
              className="w-20 h-20 md:w-28 md:h-28 object-cover rounded-xl border border-gray-200 shadow cursor-pointer"
              onClick={triggerFileInput}
            />
            <span className="text-xs text-gray-500">Logo</span>
            {/* Botones de guardar/cancelar debajo del logo */}
            {hasChanges && (
              <div className="flex gap-1 justify-center mt-2">
                <button
                  type="submit"
                  className="w-16 px-2 py-0.5 text-[10px] rounded bg-green-500 text-white hover:bg-green-600 transition"
                  disabled={loading}
                  form="comercio-form"
                >
                  <FontAwesomeIcon icon={faCheck} /> {loading ? "Guardando..." : "Guardar"}
                </button>
                <button
                  type="button"
                  className="w-16 px-2 py-0.5 text-[10px] rounded bg-red-500 text-white hover:bg-red-600 transition"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faTimes} /> Cancelar
                </button>
              </div>
            )}
          </div>
          {/* Formulario */}
          <form id="comercio-form" className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm" onSubmit={e => { e.preventDefault(); handleSave(); }}>
            <div className="flex flex-col gap-1">
              <label className="text-gray-600 font-medium">Nombre</label>
              <input
                type="text"
                value={values.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-gray-600 font-medium">Teléfono</label>
              <input
                type="text"
                value={values.telefono}
                onChange={(e) => handleChange("telefono", e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-gray-600 font-medium">Categoría</label>
              <input
                type="text"
                value={values.categorias || ""}
                onChange={(e) => handleChange("categorias", e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            {/* Dirección con input nativo y autocomplete */}
            <div className="flex flex-col gap-1">
              <label className="text-gray-600 font-medium">Dirección</label>
              <input
                type="text"
                ref={inputRef}
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Ingresa la dirección del comercio"
                id="address-input"
                autoComplete="off"
                disabled={!googleReady}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-gray-600 font-medium">Horario de Apertura</label>
              <input
                type="time"
                value={values.horario_apertura || ""}
                onChange={(e) => handleChange("horario_apertura", e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-gray-600 font-medium">Horario de Cierre</label>
              <input
                type="time"
                value={values.horario_cierre || ""}
                onChange={(e) => handleChange("horario_cierre", e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-gray-600 font-medium">Coordenadas</label>
              <input
                type="text"
                value={`${position.lat}, ${position.lng}`}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-100"
                disabled
              />
            </div>
            {error && <p className="text-xs text-red-500 md:col-span-2 mt-1">{error}</p>}
          </form>
        </div>
      </div>
      {/* Mapa */}
      <div className="w-full md:w-1/2 flex flex-col gap-2 mt-4 md:mt-0">
        <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-200">
          <GoogleMapWrapper
            center={position}
            defaultZoom={17}
            onChange={handleMapChange}
          >
            <Marker lat={position.lat} lng={position.lng} text="📍" />
          </GoogleMapWrapper>
        </div>
      </div>
    </div>
  );
};

export default ComercioCard;
