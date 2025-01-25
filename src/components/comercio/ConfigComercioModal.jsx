import React, { useState, useRef, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import GoogleMapReact from 'google-map-react';
import supabase from '../../supabase/supabase.config';

const Marker = ({ text }) => <div>{text}</div>;

const ConfigComercioModal = ({ show, onHide, onSubmit, user }) => {
    const [logoPreview, setLogoPreview] = useState(null);
    const [logoFile, setLogoFile] = useState(null);
    const fileInputRef = useRef(null);

    // Nuevos estados para dirección y posición
    const [position, setPosition] = useState({ lat: -31.42472, lng: -64.18855 });
    const [address, setAddress] = useState('');
    const autoCompleteRef = useRef(null);
    const inputRef = useRef(null);

    // Efecto para inicializar Autocomplete
    useEffect(() => {
        const interval = setInterval(() => {
            if (window.google && window.google.maps && window.google.maps.places) {
                clearInterval(interval); 
                autoCompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current);
                autoCompleteRef.current.addListener('place_changed', handlePlaceChanged);
            }
        }, 500);
    
        return () => clearInterval(interval);
    }, []);

    // Manejador de cambio de lugar
    const handlePlaceChanged = () => {
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
    };

    // Manejador de cambios en el mapa
    const handleMapChange = ({ center }) => {
        setPosition({
            lat: center.lat,
            lng: center.lng,
        });
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
        // Validar tipo de archivo (solo imágenes)
        if (file.type.startsWith('image/')) {
            // Validar tamaño del archivo (por ejemplo, máximo 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('El archivo es demasiado grande. Máximo 5MB.');
                return;
            }

            // Crear preview
            const reader = new FileReader();
            reader.onloadend = () => {
                // Opcional: Comprimir imagen antes de subir
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

    // Función de compresión de imagen (opcional)
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

                canvas.toBlob((blob) => {
                    const compressedFile = new File([blob], file.name, {
                        type: file.type,
                        lastModified: Date.now()
                    });
                    callback(compressedFile);
                }, file.type, 0.7);
            };
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // Subir logo a Supabase Storage si existe
            let logoUrl = null;
            if (logoFile) {
                const fileExt = logoFile.name.split('.').pop();
                const fileName = `${user.id}/logo_${Date.now()}.${fileExt}`;
                
                const { error: uploadError } = await supabase.storage
                    .from('Comercio')
                    .upload(fileName, logoFile);
                
                if (uploadError) {
                    console.error('Error subiendo logo:', uploadError);
                    return;
                }

                // Obtener URL pública
                const { data: urlData } = supabase.storage
                    .from('Comercio')
                    .getPublicUrl(fileName);
                
                logoUrl = urlData.publicUrl;
            }

            // Preparar datos del formulario
            const formData = {
                nombre: e.target.nombre.value,
                telefono: e.target.telefono.value,
                logo_url: logoUrl,
                direccion: address,
                latitud: position.lat,
                longitud: position.lng
            };

            // Llamar a la función de submit pasada como prop
            onSubmit(formData);
        } catch (error) {
            console.error('Error en handleSubmit:', error);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Configurar Comercio</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="nombre" className="form-label">Nombre del Comercio</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            id="nombre" 
                            name="nombre" 
                            required 
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="telefono" className="form-label">Teléfono</label>
                        <input 
                            type="tel" 
                            className="form-control" 
                            id="telefono" 
                            name="telefono" 
                            required 
                        />
                    </div>
                    
                    {/* Nuevo campo de dirección */}
                    <div className="mb-3">
                        <label htmlFor="address-input" className="form-label">Dirección del Comercio</label>
                        <input
                            type="text"
                            id="address-input"
                            ref={inputRef}
                            placeholder="Ingresa la dirección del comercio"
                            className="form-control"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>

                    {/* Contenedor del mapa */}
                    <div className="mb-3" style={{ height: '400px', width: '100%' }}>
                        <GoogleMapReact
                            bootstrapURLKeys={{ 
                                key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY, 
                                libraries: ['places'] 
                            }}
                            center={position}
                            defaultZoom={17}
                            onChange={handleMapChange}
                        >
                            <Marker lat={position.lat} lng={position.lng} text="📍" />
                        </GoogleMapReact>
                    </div>

                    {/* Logo */}
                    <div className="mb-3">
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
                    </div>
                    
                    <button type="submit" className="btn btn-primary">Guardar Configuración</button>
                </form>
            </Modal.Body>
        </Modal>
    );
};

export default ConfigComercioModal;