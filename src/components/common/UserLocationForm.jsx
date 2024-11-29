import React, { useRef, useState, useEffect, useCallback } from 'react';
import GoogleMapReact from 'google-map-react';
import './UserLocationForm.css';
import supabase from '../../supabase/supabase.config';

const Marker = ({ text }) => <div>{text}</div>;

const UserLocationForm = ({ show, handleClose, handleSave, user }) => {
    const [position, setPosition] = useState({ lat: -31.42472, lng: -64.18855 });
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState(null);
    const autoCompleteRef = useRef(null);
    const inputRef = useRef(null);

    const handleMapChange = useCallback(({ center }) => {
        setPosition({
            lat: center.lat,
            lng: center.lng,
        });
    }, []);

    const handlePlaceChanged = useCallback(() => {
        const place = autoCompleteRef.current.getPlace();
        if (place && place.geometry) {
            const location = place.geometry.location;
            const newPosition = {
                lat: location.lat(),
                lng: location.lng(),
            };
            setPosition(newPosition); 
            setAddress(place.formatted_address || place.name);
            handleMapChange({ center: newPosition });
        }
    }, [handleMapChange]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (window.google && window.google.maps && window.google.maps.places) {
                clearInterval(interval); 
                autoCompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current);
                autoCompleteRef.current.addListener('place_changed', handlePlaceChanged);
            }
        }, 500);
    
        return () => clearInterval(interval);
    }, [handlePlaceChanged]);

    const handleSavePosition = async () => {
        if (!address) {
            alert('Por favor ingrese una dirección de envío');
            return;
        }

        try {
            const { error: locationError } = await supabase
                .from('user_locations')
                .insert([
                    {
                        user_id: user.id,
                        address: address,
                        latitude: position.lat,
                        longitude: position.lng
                    },
                ]);

            if (locationError) throw locationError;

            if (phone) {
                const { error: phoneError } = await supabase
                    .from('user_data')
                    .upsert([
                        {
                            user_id: user.id,
                            phone: phone,
                        },
                    ]);

                if (phoneError) throw phoneError;
            }

            alert(`Ubicación guardada: Dirección: ${address}, Latitud: ${position.lat}, Longitud: ${position.lng}`);
            handleSave(address, position);
            handleClose();
        } catch (error) {
            console.error('Error al guardar la ubicación o el teléfono en Supabase:', error.message);
            alert('Hubo un error al guardar la ubicación o el teléfono. Inténtalo de nuevo.');
        }
    };

    if (!show) return null;

    console.log('Address:', address, '  position lat:', position.lat, ' lng:', position.lng);

    return (
        <div className="floating-form-container">
            <div className="floating-form">
                {user?.user_data && !user.user_data.phone && (
                    <input
                        type="text"
                        id="phone-input"
                        placeholder="Ingresa un número de teléfono"
                        className="input-address"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                )}
                <input
                    type="text"
                    id="address-input"
                    placeholder="Ingresa una dirección"
                    className="input-address"
                    ref={inputRef}
                />

                <div className="map-container">
                    <GoogleMapReact
                        bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY, libraries: ['places'] }}
                        center={position}
                        defaultZoom={17}
                        onChange={handleMapChange}
                    >
                        <Marker lat={position.lat} lng={position.lng} text="📍" />
                    </GoogleMapReact>
                </div>

                <div className="button-group">
                    <button onClick={handleClose} className="cancel-button">
                        Cancelar
                    </button>
                    <button onClick={handleSavePosition} className="save-button">
                        Guardar Ubicación
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserLocationForm;
