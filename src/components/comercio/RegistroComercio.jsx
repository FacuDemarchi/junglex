import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleMapReact from 'google-map-react';
import supabase from '../../supabase/supabase.config';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import Script from 'react-load-script';

const Marker = ({ text }) => <div>{text}</div>;

const RegistroComercio = () => {
  const navigate = useNavigate();
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const fileInputRef = useRef(null);
  const [position, setPosition] = useState({ lat: -31.42472, lng: -64.18855 });
  const [address, setAddress] = useState('');
  const [categories, setCategories] = useState([]);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [delayedRender, setDelayedRender] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    categorias: '',
    horario_apertura: '',
    horario_cierre: '',
    dis_max_envio_km: 0
  });

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
    setDelayedRender(true);
  }, []);

  const handleSelect = (selectedAddress) => {
    setAddress(selectedAddress);
    geocodeByAddress(selectedAddress)
      .then((results) => getLatLng(results[0]))
      .then((latLng) => {
        setPosition(latLng);
      })
      .catch((error) => console.error('Error en geocodeByAddress:', error));
  };

  const handleMapChange = ({ center }) => {
    setPosition({ lat: center.lat, lng: center.lng });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    if (file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        compressImage(file, (compressedFile) => {
          setLogoPreview(reader.result);
          setLogoFile(compressedFile || file);
        });
      };
      reader.readAsDataURL(file);
    } else {
      alert('Por favor, selecciona un archivo de imagen válido');
    }
  };

  const compressImage = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
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
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            callback(compressedFile);
          },
          file.type,
          0.7
        );
      };
    };
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!address) {
        alert('Por favor, seleccione una dirección');
        return;
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Verificar si el comercio ya existe
      const { data: existingComercio, error: checkError } = await supabase
        .from('comercios')
        .select('*')
        .eq('id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 es el código cuando no se encuentra el registro
        throw checkError;
      }

      let logoUrl = null;
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${user.id}/logo.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('comercios')
          .upload(fileName, logoFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('comercios')
          .getPublicUrl(fileName);

        logoUrl = urlData.publicUrl;
      } else if (existingComercio?.logo) {
        // Si no se sube un nuevo logo y existe uno anterior, mantener el anterior
        logoUrl = existingComercio.logo;
      }

      const comercioData = {
        id: user.id,
        nombre: formData.nombre,
        direccion: address,
        telefono: formData.telefono,
        categorias: formData.categorias,
        logo: logoUrl,
        latitude: position.lat,
        longitude: position.lng,
        horario_apertura: formData.horario_apertura,
        horario_cierre: formData.horario_cierre,
        dis_max_envio_km: formData.dis_max_envio_km
      };

      const { error: comercioError } = await supabase
        .from('comercios')
        .upsert(comercioData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });

      if (comercioError) throw comercioError;

      const { error: userDataError } = await supabase
        .from('user_data')
        .upsert({
          user_id: user.id,
          user_type: 'comercio'
        });

      if (userDataError) throw userDataError;

      alert(existingComercio ? 'Comercio actualizado exitosamente' : 'Registro exitoso');
      navigate('/');
    } catch (error) {
      console.error('Error en el registro:', error);
      alert('Error en el registro: ' + error.message);
    }
  };

  const handleScriptLoad = () => {
    setScriptLoaded(true);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Registro de Comercio</h2>
      <Script
        url={`https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`}
        onLoad={handleScriptLoad}
      />
      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
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
            <div className="mb-3 mt-3">
              <label htmlFor="categorias" className="form-label">
                Categoría
              </label>
              <select 
                className="form-select" 
                id="categorias" 
                name="categorias" 
                value={formData.categorias}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccione una categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
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
                value={formData.nombre}
                onChange={handleInputChange}
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
                value={formData.telefono}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="horario_apertura" className="form-label">
                    Horario de apertura
                  </label>
                  <input
                    type="time"
                    className="form-control"
                    id="horario_apertura"
                    name="horario_apertura"
                    value={formData.horario_apertura}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="horario_cierre" className="form-label">
                    Horario de cierre
                  </label>
                  <input
                    type="time"
                    className="form-control"
                    id="horario_cierre"
                    name="horario_cierre"
                    value={formData.horario_cierre}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="dis_max_envio_km" className="form-label">
                Distancia máxima de envío (km)
              </label>
              <input
                type="number"
                className="form-control"
                id="dis_max_envio_km"
                name="dis_max_envio_km"
                value={formData.dis_max_envio_km}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>
          </div>
        </div>
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
                  <div className="suggestions-container" style={{ 
                    position: 'absolute', 
                    zIndex: 1000,
                    width: '100%',
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {loading && <div>Cargando...</div>}
                    {suggestions.map((suggestion, index) => {
                      const className = suggestion.active
                        ? 'suggestion-item--active'
                        : 'suggestion-item';
                      const style = suggestion.active
                        ? { backgroundColor: '#fafafa', cursor: 'pointer', padding: '5px' }
                        : { backgroundColor: '#ffffff', cursor: 'pointer', padding: '5px' };
                      return (
                        <div key={index} {...getSuggestionItemProps(suggestion, { className, style })}>
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
        <div className="mb-3" style={{ 
          height: '400px', 
          width: '100%',
          position: 'relative',
          border: '1px solid #ddd',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          {delayedRender ? (
            <GoogleMapReact
              bootstrapURLKeys={{
                key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
                libraries: ['places']
              }}
              center={position}
              defaultZoom={17}
              onChange={handleMapChange}
              yesIWantToUseGoogleMapApiInternals
              options={{
                fullscreenControl: true,
                zoomControl: true,
                streetViewControl: true,
                mapTypeControl: true,
                styles: [
                  {
                    featureType: "poi",
                    elementType: "labels",
                    stylers: [{ visibility: "off" }]
                  }
                ]
              }}
            >
              <Marker 
                lat={position.lat} 
                lng={position.lng} 
                text="📍"
                style={{
                  position: 'absolute',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '24px'
                }}
              />
            </GoogleMapReact>
          ) : (
            <div className="d-flex justify-content-center align-items-center h-100">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando mapa...</span>
              </div>
            </div>
          )}
        </div>
        <button type="submit" className="btn btn-primary">
          Registrar Comercio
        </button>
      </form>
    </div>
  );
};

export default RegistroComercio; 