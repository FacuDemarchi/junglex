import React, { useRef, useState, useEffect, useCallback } from 'react';
import GoogleMapWrapper from './GoogleMapWrapper';
import './UserLocationForm.css';
import supabase from '../../supabase/supabase.config';
import { useGoogleMaps } from '../../context/GoogleMapsContext';

const Marker = ({ text }) => <div>{text}</div>;

const UserLocationForm = ({ show, handleClose, handleSave, user }) => {
    const [position, setPosition] = useState({ lat: -31.42472, lng: -64.18855 });
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const autoCompleteRef = useRef(null);
    const inputRef = useRef(null);
    const { isLoaded: googleReady } = useGoogleMaps();

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
        if (googleReady && window.google?.maps?.places && inputRef.current) {
            autoCompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current);
            autoCompleteRef.current.addListener('place_changed', handlePlaceChanged);
        }
    }, [googleReady, handlePlaceChanged]);

    const handleSavePosition = async () => {
        if (isSaving) return;
        
        if (!address) {
            alert('Por favor ingrese una dirección de envío');
            return;
        }

        setIsSaving(true);

        try {
            const { data: existingLocations, error: checkError } = await supabase
                .from('user_locations')
                .select('*')
                .eq('user_id', user.id)
                .eq('address', address)
                .eq('latitude', position.lat)
                .eq('longitude', position.lng);

            if (checkError) throw checkError;

            if (existingLocations && existingLocations.length > 0) {
                alert('Esta ubicación ya está guardada');
                handleSave(address, position);
                handleClose();
                return;
            }

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
        } finally {
            setIsSaving(false);
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
                                    <GoogleMapWrapper
                    center={position}
                    defaultZoom={17}
                    onChange={handleMapChange}
                >
                    <Marker lat={position.lat} lng={position.lng} text="📍" />
                </GoogleMapWrapper>
                </div>

                <div className="button-group">
                    <button onClick={handleClose} className="cancel-button" disabled={isSaving}>
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSavePosition} 
                        className="save-button"
                        disabled={isSaving}
                    >
                        {isSaving ? 'Guardando...' : 'Guardar Ubicación'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserLocationForm;
