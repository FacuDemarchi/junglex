import React, { useRef, useState, useEffect } from 'react';
import GoogleMapReact from 'google-map-react';
import './UserLocationForm.css'; 
import supabase from '../../supabase/supabase.config';

const Marker = ({ text }) => <div>{text}</div>;

const UserLocationForm = ({ show, handleClose, handleSave, user }) => {
    const [position, setPosition] = useState({ lat: -31.42472, lng: -64.18855 });
    const [address, setAddress] = useState('');
    const autoCompleteRef = useRef(null);

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (window.google && window.google.maps) {
                if (!autoCompleteRef.current) {
                    autoCompleteRef.current = new window.google.maps.places.Autocomplete(document.getElementById('address-input'));
                    autoCompleteRef.current.addListener('place_changed', handlePlaceChanged);
                    clearInterval(intervalId);
                }
            }
        }, 200);

        return () => clearInterval(intervalId);
    }, []);

    const handlePlaceChanged = () => {
        const place = autoCompleteRef.current.getPlace();
        if (place && place.geometry) {
            const location = place.geometry.location;
            setPosition({
                lat: location.lat(),
                lng: location.lng(),
            });
            setAddress(place.formatted_address || place.name);
        }
    };

    const handleMapChange = ({ center }) => {
        setPosition({
            lat: center.lat,
            lng: center.lng,
        });
    };

    const handleSavePosition = async () => {
        if (!address) {
            alert('Por favor ingrese una dirección de envío');
            return;
        }

        try {
            const { error } = await supabase
                .from('user_locations') 
                .insert([
                    {
                        user_id: user.id, 
                        address: address,
                        latitude: position.lat,
                        longitude: position.lng
                    },
                ]);
    
            if (error) throw error;
    
            alert(`Ubicación guardada: Dirección: ${address}, Latitud: ${position.lat}, Longitud: ${position.lng}`);
            handleSave(address, position); 
        } catch (error) {
            console.error('Error al guardar la ubicación en Supabase:', error.message);
            alert('Hubo un error al guardar la ubicación. Inténtalo de nuevo.');
        }
    };

    if (!show) return null; 

    return (
        <div className="floating-form-container">
            <div className="floating-form">
                <input
                    type="text"
                    id="address-input"
                    placeholder="Ingresa una dirección"
                    className="input-address"
                />

                <div className="map-container">
                    <GoogleMapReact
                        bootstrapURLKeys={{ key: 'AIzaSyDYEyfe7BZ2Q7CvuHZASkVhzoJHRkSqJW8', libraries: ['places'] }}
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
