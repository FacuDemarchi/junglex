import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { GoogleMap, Marker, InfoWindow, LoadScript } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '400px'
};

const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const UserLocationForm = ({ user, show, handleClose, handleSave, showPhoneNumber }) => {
    const [address, setAddress] = useState('');
    const [position, setPosition] = useState(null);
    const [phone, setPhone] = useState('');

    useEffect(() => {
        setPhone(user.phone || '');
    }, [user]);

    const handleMapClick = (e) => {
        setPosition(e.latLng.toJSON());
    };

    const handleAddressChange = (e) => {
        setAddress(e.target.value);
    };

    const handlePhoneChange = (e) => {
        setPhone(e.target.value);
    };

    const handleSubmit = async () => {
        try {
            handleSave(address, position, showPhoneNumber ? phone : null);
            handleClose();
        } catch (error) {
            console.error('Error al guardar la ubicación:', error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Registro de Ubicación</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {showPhoneNumber && (
                    <Form.Group controlId="formPhone">
                        <Form.Label>Número de Teléfono</Form.Label>
                        <Form.Control
                            type="tel"
                            placeholder="Ingresa tu número de teléfono"
                            value={phone}
                            onChange={handlePhoneChange}
                        />
                    </Form.Group>
                )}

                <Form.Group controlId="formAddress">
                    <Form.Label>Dirección</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Ingresa tu dirección"
                        value={address}
                        onChange={handleAddressChange}
                    />
                </Form.Group>

                <LoadScript googleMapsApiKey={apiKey}>
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={{ lat: -31.417, lng: -64.183 }}
                        zoom={13}
                        onClick={handleMapClick}
                    >
                        {position && (
                            <Marker position={position}>
                                <InfoWindow>
                                    <div>
                                        <p>Ubicación seleccionada</p>
                                    </div>
                                </InfoWindow>
                            </Marker>
                        )}
                    </GoogleMap>
                </LoadScript>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleSubmit}>
                    Guardar Ubicación
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default UserLocationForm;
