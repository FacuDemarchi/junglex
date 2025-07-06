import React, { useState, useRef, useEffect, ChangeEvent, DragEvent, FormEvent } from 'react';
import Modal from 'react-bootstrap/Modal';
import GoogleMapReact from 'google-map-react';
import supabase from '../../supabase/supabase.config';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import { useScript } from '../../hooks/useScript';

interface User {
  id: string;
  user_data?: {
    user_type: string;
  };
}

interface RegistrarComercioProps {
  show: boolean;
  onHide: () => void;
  user: User;
}

interface Categoria {
  id: string;
  nombre: string;
}

interface Position {
  lat: number;
  lng: number;
}

// Marker debe aceptar lat y lng para GoogleMapReact
const Marker: React.FC<{ lat?: number; lng?: number; text: string }> = ({ text }) => <div>{text}</div>;

const RegistrarComercio: React.FC<RegistrarComercioProps> = ({ show, onHide, user }) => {
  // Estados para la imagen
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Estados para la dirección y posición
  const [position, setPosition] = useState<Position>({ lat: -31.42472, lng: -64.18855 });
  const [address, setAddress] = useState<string>('');

  // Estado para las categorías
  const [categories, setCategories] = useState<Categoria[]>([]);

  // Estado para saber si la librería de Google Maps se cargó
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(false);

  const [delayedRender, setDelayedRender] = useState<boolean>(false);

  const status = useScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&libraries=places');

  useEffect(() => {
    if (status === 'ready') {
      setScriptLoaded(true);
    }
  }, [status]);

  // Cargar las categorías desde Supabase
  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase.from('categorias').select('*');
      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        setCategories(data || []);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    // Cuando el modal se abre, se retrasa la renderización de ciertos campos
    if (show) {
      const timer = setTimeout(() => {
        setDelayedRender(true);
      }, 2000); // 2 segundos de delay

      return () => clearTimeout(timer);
    } else {
      setDelayedRender(false);
    }
  }, [show]);

  // Función que se ejecuta cuando se selecciona una dirección en el autocomplete
  const handleSelect = (selectedAddress: string) => {
    setAddress(selectedAddress);
    geocodeByAddress(selectedAddress)
      .then((results) => getLatLng(results[0]))
      .then((latLng) => {
        setPosition(latLng);
      })
      .catch((error) => console.error('Error en geocodeByAddress:', error));
  };

  // Actualizar la posición cuando se mueve el mapa
  const handleMapChange = ({ center }: { center: Position }) => {
    setPosition({ lat: center.lat, lng: center.lng });
  };

  // Manejo del archivo de imagen
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        // Se puede comprimir la imagen (opcional)
        compressImage(file, (compressedFile) => {
          setLogoPreview(reader.result as string);
          setLogoFile(compressedFile || file);
        });
      };
      reader.readAsDataURL(file);
    } else {
      alert('Por favor, selecciona un archivo de imagen válido');
    }
  };

  const compressImage = (file: File, callback: (compressedFile: File | null) => void) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                });
                callback(compressedFile);
              } else {
                callback(null);
              }
            },
            file.type,
            0.7
          );
        } else {
          callback(null);
        }
      };
    };
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Manejo del submit del formulario
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // Validación de dirección
      if (!address) {
        alert('Por favor, seleccione una dirección');
        return;
      }

      let logoUrl: string | null = null;
      if (logoFile) {
        // Se obtiene la extensión del archivo
        const fileExt = logoFile.name.split('.').pop();
        // Se crea un nombre de archivo fijo para evitar múltiples versiones.
        // De esta forma, si ya existe un logo, se sobreescribe.
        const fileName = `${user.id}/logo.${fileExt}`;

        // Subir la imagen usando la opción upsert: true para sobrescribir si existe
        const { error: uploadError } = await supabase.storage
          .from('comercios')
          .upload(fileName, logoFile, { upsert: true });

        if (uploadError) {
          console.error('Error subiendo logo:', uploadError);
          alert('No se pudo subir el logo. Intente nuevamente.');
          return;
        }

        // Obtener la URL pública del archivo
        const { data: urlData } = supabase.storage
          .from('comercios')
          .getPublicUrl(fileName);

        logoUrl = urlData.publicUrl;
      }

      // Preparar los datos a insertar en la tabla "comercios"
      const form = e.target as HTMLFormElement;
      const comercioData = {
        id: user.id, // Se asigna el id igual al user.id
        nombre: (form.nombre as HTMLInputElement).value,
        direccion: address,
        telefono: (form.telefono as HTMLInputElement).value,
        categorias: (form.categoria as HTMLSelectElement).value,
        logo: logoUrl,
        latitude: position.lat,
        longitude: position.lng,
        horario_apertura: (form.hora_apertura as HTMLInputElement).value,
        horario_cierre: (form.hora_cierre as HTMLInputElement).value
      };

      // Insertar la configuración inicial del comercio
      const { error } = await supabase
        .from('comercios')
        .insert(comercioData);

      if (error) {
        console.error('Error guardando comercio:', error);
        alert('No se pudo guardar la configuración del comercio');
        return;
      }

      // Cerrar el modal una vez guardada la configuración
      onHide();

    } catch (error) {
      console.error('Error en handleSubmit:', error);
      alert('Ocurrió un error al guardar la configuración');
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Configurar Comercio</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          {/* Sección de dos columnas: izquierda para logo y categoría, derecha para datos */}
          <div className="row mb-3">
            {/* Columna izquierda */}
            <div className="col-md-6">
              <label className="form-label">Logo del Comercio</label>
              <div
                onClick={triggerFileInput}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{
                  border: '2px dashed #ccc',
                  borderRadius: '4px',
                  padding: '20px',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
              >
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      objectFit: 'contain'
                    }}
                  />
                ) : (
                  <p>Arrastra y suelta tu logo aquí o haz clic para seleccionar</p>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              {/* Desplegable de categorías */}
              <div className="mb-3 mt-3">
                <label htmlFor="categoria" className="form-label">
                  Categoría
                </label>
                <select className="form-select" id="categoria" name="categoria" required>
                  <option value="">Seleccione una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* Columna derecha */}
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="nombre" className="form-label">
                  Nombre del Comercio
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="nombre"
                  name="nombre"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="telefono" className="form-label">
                  Teléfono
                </label>
                <input
                  type="tel"
                  className="form-control"
                  id="telefono"
                  name="telefono"
                  required
                />
              </div>
              {/* Campos para horarios (lado a lado) */}
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="hora_apertura" className="form-label">
                      Horario de apertura
                    </label>
                    <input
                      type="time"
                      className="form-control"
                      id="hora_apertura"
                      name="hora_apertura"
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="hora_cierre" className="form-label">
                      Horario de cierre
                    </label>
                    <input
                      type="time"
                      className="form-control"
                      id="hora_cierre"
                      name="hora_cierre"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Campo para la dirección usando react-places-autocomplete */}
          <div className="mb-3">
            <label htmlFor="address-input" className="form-label">
              Dirección del Comercio
            </label>
            {delayedRender && scriptLoaded ? (
              <PlacesAutocomplete
                value={address}
                onChange={setAddress}
                onSelect={handleSelect}
                debounce={300}
              >
                {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                  <div>
                    <input
                      {...getInputProps({
                        placeholder: 'Ingresa la dirección del comercio',
                        className: 'form-control',
                        id: 'address-input'
                      })}
                    />
                    <div>
                      {loading && <div>Cargando...</div>}
                      {suggestions.map((suggestion, index) => {
                        const className = suggestion.active
                          ? 'suggestion-item--active'
                          : 'suggestion-item';
                        const style = suggestion.active
                          ? { backgroundColor: '#fafafa', cursor: 'pointer', padding: '5px' }
                          : { backgroundColor: '#ffffff', cursor: 'pointer', padding: '5px' };
                        return (
                          <div {...getSuggestionItemProps(suggestion, { className, style })}>
                            <span>{suggestion.description}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </PlacesAutocomplete>
            ) : (
              <div>Cargando dirección...</div>
            )}
          </div>
          {/* Mapa para ubicar la dirección */}
          <div className="mb-3" style={{ height: '400px', width: '100%' }}>
            {delayedRender ? (
              <GoogleMapReact
                bootstrapURLKeys={{
                  key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string,
                  libraries: ['places']
                }}
                center={position}
                defaultZoom={17}
                onChange={handleMapChange}
              >
                <Marker lat={position.lat} lng={position.lng} text="📍" />
              </GoogleMapReact>
            ) : (
              <div>Cargando mapa...</div>
            )}
          </div>
          <button type="submit" className="btn btn-primary">
            Guardar Configuración
          </button>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default RegistrarComercio;
