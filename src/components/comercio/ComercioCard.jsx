import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencilAlt, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import supabase from "../../supabase/supabase.config";
import "./styles/comercioCard.css";

const ComercioCard = ({ comercio, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [values, setValues] = useState({ ...comercio });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Sincronizar el estado local con la prop comercio cuando esta cambie
  useEffect(() => {
    setValues({ ...comercio });
  }, [comercio]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("comercios")
        .update({
          nombre: values.nombre,
          direccion: values.direccion,
          telefono: values.telefono,
          categorias: values.categorias,
          horario_apertura: values.horario_apertura,
          horario_cierre: values.horario_cierre,
        })
        .eq("id", comercio.id);

      if (error) throw error;

      if (onUpdate) onUpdate(data[0]); // Actualizar el estado externo
      setIsEditing(false);
    } catch (error) {
      console.error("Error al guardar los cambios:", error.message);
      setError("No se pudo guardar los cambios.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setValues({ ...comercio });
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoChange = async (event) => {
    const file = event.target.files[0];
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

        const {
          data: { publicUrl },
          error: urlError,
        } = supabase.storage.from("comercios").getPublicUrl(filePath);

        if (urlError) throw urlError;

        await supabase
          .from("comercios")
          .update({ logo: publicUrl })
          .eq("id", comercio.id);

        if (onUpdate) onUpdate({ ...comercio, logo: publicUrl });

        setLoading(false);
      } catch (error) {
        console.error("Error al cargar el logo:", error.message);
        setError("No se pudo cargar el logo.");
        setLoading(false);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="comercio-card-container">
      {/* Botón de edición flotante */}
      <button className="edit-button" onClick={handleEdit} disabled={loading}>
        <FontAwesomeIcon icon={faPencilAlt} />
      </button>

      {/* Contenedor de información del comercio */}
      <div className="comercio-header-container">
        {/* Contenedor de logo sin icono superpuesto */}
        <div className="logo-upload-container">
          {/* Input de archivo oculto */}
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleLogoChange}
            accept="image/*"
            style={{ display: "none" }}
            disabled={loading}
          />

          {/* La imagen ahora dispara el input file al hacer click */}
          <div className="logo-wrapper">
            <img
              src={comercio.logo || "/placeholder-logo.png"}
              alt={`${comercio.nombre} logo`}
              className="comercio-logo"
              onClick={triggerFileInput}
              style={{ cursor: "pointer" }}
            />
          </div>
        </div>

        {/* Información del comercio */}
        <div className="comercio-info">
          {/* Nombre */}
          <div className="editable-field">
            {isEditing ? (
              <input
                type="text"
                value={values.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                className="edit-input"
                autoFocus
              />
            ) : (
              <h3>{comercio.nombre}</h3>
            )}
          </div>

          {/* Dirección */}
          <div className="editable-field">
            {isEditing ? (
              <input
                type="text"
                value={values.direccion}
                onChange={(e) => handleChange("direccion", e.target.value)}
                className="edit-input"
              />
            ) : (
              <p>Dirección: {comercio.direccion}</p>
            )}
          </div>

          {/* Teléfono */}
          <div className="editable-field">
            {isEditing ? (
              <input
                type="text"
                value={values.telefono}
                onChange={(e) => handleChange("telefono", e.target.value)}
                className="edit-input"
              />
            ) : (
              <p>Teléfono: {comercio.telefono}</p>
            )}
          </div>

          {/* Categoría */}
          <div className="editable-field">
            {isEditing ? (
              <input
                type="text"
                value={values.categorias || ""}
                onChange={(e) => handleChange("categorias", e.target.value)}
                className="edit-input"
                placeholder="Categoría"
              />
            ) : (
              <p>Categoría: {comercio.categorias}</p>
            )}
          </div>

          {/* Horario de Apertura */}
          <div className="editable-field">
            {isEditing ? (
              <input
                type="time"
                value={values.horario_apertura || ""}
                onChange={(e) => handleChange("horario_apertura", e.target.value)}
                className="edit-input"
              />
            ) : (
              <p>Horario de Apertura: {comercio.horario_apertura}</p>
            )}
          </div>

          {/* Horario de Cierre */}
          <div className="editable-field">
            {isEditing ? (
              <input
                type="time"
                value={values.horario_cierre || ""}
                onChange={(e) => handleChange("horario_cierre", e.target.value)}
                className="edit-input"
              />
            ) : (
              <p>Horario de Cierre: {comercio.horario_cierre}</p>
            )}
          </div>

          {/* Coordenadas (solo lectura) */}
          <div className="editable-field">
            <p>
              Coordenadas: {comercio.latitude}, {comercio.longitude}
            </p>
          </div>

          {/* Botones de guardar/cancelar */}
          {isEditing && (
            <div className="buttons-container">
              <button
                className="icon-button save"
                onClick={handleSave}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faCheck} /> {loading ? "Guardando..." : "Guardar"}
              </button>
              <button
                className="icon-button cancel"
                onClick={handleCancel}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faTimes} /> Cancelar
              </button>
            </div>
          )}

          {/* Mensaje de error */}
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default ComercioCard;
