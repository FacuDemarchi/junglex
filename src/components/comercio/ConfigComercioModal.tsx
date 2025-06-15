import React, { useState, useRef, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import GoogleMapReact from 'google-map-react';
import supabase from '../../supabase/supabase.config';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import { useScript } from '../../hooks/useScript';
import './styles/ConfigComercioModal.modal.css';

interface MarkerProps {
  text: string;
  lat: number;
  lng: number;
}

interface ConfigComercioModalProps {
  show: boolean;
  onHide: () => void;
  user: {
    id: string;
  };
}

interface Position {
  lat: number;
  lng: number;
}

interface Category {
  id: number;
  nombre: string;
}

interface ComercioData {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  categorias: string;
  logo: string | null;
  latitude: number;
  longitude: number;
  horario_apertura: string;
  horario_cierre: string;
}

interface GeocodeResult {
  formatted_address: string;
  geometry: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
}

interface PlacesAutocompleteProps {
  getInputProps: (props?: any) => any;
  suggestions: Array<{
    placeId: string;
    description: string;
  }>;
  getSuggestionItemProps: (suggestion: any) => any;
  loading: boolean;
}

const Marker: React.FC<MarkerProps> = ({ text }) => <div>{text}</div>;

const ConfigComercioModal: React.FC<ConfigComercioModalProps> = ({ show, onHide, user }) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [position, setPosition] = useState<Position>({ lat: -31.42472, lng: -64.18855 });
  const [address, setAddress] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(false);
  const [loadedComponents, setLoadedComponents] = useState({
    autocomplete: false,
    map: false
  });
  const [fadeIn, setFadeIn] = useState(false);

  const status = useScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&libraries=places');

  useEffect(() => {
    if (status === 'ready') {
      setScriptLoaded(true);
    }
  }, [status]);

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase.from('categorias').select('*');
      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        setCategories(data);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    if (show) {
      setTimeout(() => {
        setLoadedComponents(prev => ({ ...prev, autocomplete: true }));
        setTimeout(() => {
          setLoadedComponents(prev => ({ ...prev, map: true }));
          setFadeIn(true);
        }, 300);
      }, 200);
    } else {
      setLoadedComponents({ autocomplete: false, map: false });
      setFadeIn(false);
    }
  }, [show]);

  const handleSelect = (selectedAddress: string) => {
    setAddress(selectedAddress);
    geocodeByAddress(selectedAddress)
      .then((results: GeocodeResult[]) => getLatLng(results[0]))
      .then((latLng: { lat: number; lng: number }) => {
        setPosition(latLng);
      })
      .catch((error: Error) => console.error('Error en geocodeByAddress:', error));
  };

  const handleMapChange = ({ center }: { center: Position }) => {
    setPosition({ lat: center.lat, lng: center.lng });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
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

  const compressImage = (file: File, callback: (file: File) => void) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
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
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              callback(compressedFile);
            }
          },
          file.type,
          0.7
        );
      };
    };
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!address) {
        alert('Por favor, seleccione una dirección');
        return;
      }

      let logoUrl = null;
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${user.id}/logo.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('comercios')
          .upload(fileName, logoFile, { upsert: true });

        if (uploadError) {
          console.error('Error subiendo logo:', uploadError);
          alert('No se pudo subir el logo. Intente nuevamente.');
          return;
        }

        const { data: urlData } = supabase.storage
          .from('comercios')
          .getPublicUrl(fileName);

        logoUrl = urlData.publicUrl;
      }

      const form = e.target as HTMLFormElement;
      const comercioData: ComercioData = {
        id: user.id,
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

      const { error } = await supabase
        .from('comercios')
        .insert(comercioData);

      if (error) {
        console.error('Error guardando comercio:', error);
        alert('No se pudo guardar la configuración del comercio');
        return;
      }

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
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Logo del Comercio</label>
              <div
                className="border rounded p-3 text-center"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={triggerFileInput}
                style={{ cursor: 'pointer' }}
              >
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    style={{ maxWidth: '100%', maxHeight: '200px' }}
                  />
                ) : (
                  <div>
                    <i className="bi bi-cloud-upload fs-1"></i>
                    <p>Arrastra y suelta una imagen o haz clic para seleccionar</p>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Nombre del Comercio</label>
                <input
                  type="text"
                  className="form-control"
                  name="nombre"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Teléfono</label>
                <input
                  type="tel"
                  className="form-control"
                  name="telefono"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Categoría</label>
                <select
                  className="form-select"
                  name="categoria"
                  required
                >
                  <option value="">Seleccione una categoría</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.nombre}>
                      {category.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Horario de Apertura</label>
                <input
                  type="time"
                  className="form-control"
                  name="hora_apertura"
                  required
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Horario de Cierre</label>
                <input
                  type="time"
                  className="form-control"
                  name="hora_cierre"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="address-input" className="form-label">
              Dirección del Comercio
            </label>
            <div className={`component-container ${fadeIn ? 'fade-in' : ''}`}>
              {loadedComponents.autocomplete && scriptLoaded ? (
                <PlacesAutocomplete
                  value={address}
                  onChange={setAddress}
                  onSelect={handleSelect}
                  debounce={300}
                >
                  {({ getInputProps, suggestions, getSuggestionItemProps, loading }: PlacesAutocompleteProps) => (
                    <div>
                      <input
                        {...getInputProps({
                          className: 'form-control',
                          placeholder: 'Buscar dirección...'
                        })}
                      />
                      <div className="autocomplete-dropdown-container">
                        {loading && <div className="loading-spinner" />}
                        {suggestions.map((suggestion) => (
                          <div
                            {...getSuggestionItemProps(suggestion)}
                            key={suggestion.placeId}
                            className="suggestion-item"
                          >
                            {suggestion.description}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </PlacesAutocomplete>
              ) : (
                <div className="loading-placeholder">
                  <div className="loading-spinner" />
                  <span>Cargando dirección...</span>
                </div>
              )}
            </div>
          </div>

          <div className="mb-3 map-container">
            <div className={`component-container ${fadeIn ? 'fade-in' : ''}`}>
              {loadedComponents.map ? (
                <GoogleMapReact
                  bootstrapURLKeys={{ key: 'AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg' }}
                  center={position}
                  zoom={15}
                  onChange={handleMapChange}
                >
                  <Marker
                    lat={position.lat}
                    lng={position.lng}
                    text="📍"
                  />
                </GoogleMapReact>
              ) : (
                <div className="loading-placeholder">
                  <div className="loading-spinner" />
                  <span>Cargando mapa...</span>
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            Guardar Configuración
          </button>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default ConfigComercioModal;