import React, { useState } from 'react';
import { Navbar, Nav, Dropdown } from 'react-bootstrap';
import { BsPersonFill } from "react-icons/bs";
import { useAuth } from '../../context/AuthContext';
import UserLocationForm from '../client/UserLocationForm';
import supabase from '../../supabase/supabase.config';

const HeaderComercio = ({ user, onViewChange }) => {
    const { signOut } = useAuth();
    const [showLocationForm, setShowLocationForm] = useState(false);
    
    const handleSaveLocation = async (address, position, phone) => {
        const newLocation = { address, latitude: position.lat, longitude: position.lng, user_id: user.id };
        
        // Guardar nueva ubicación
        const { error: locationError } = await supabase
            .from('user_locations')
            .insert([newLocation]);

        if (locationError) {
            console.error('Error saving new location:', locationError.message);
        } else {
            setShowLocationForm(false);
        }

        // Si se proporcionó un número de teléfono, actualizar en auth.users
        if (phone) {
            const { error: phoneError } = await supabase
                .from('user_data')
                .update({ phone })
                .eq('id', user.id);

            if (phoneError) {
                console.error('Error updating phone number:', phoneError.message);
            }
        }
    };

    return (
        <>
            <Navbar bg="light" expand="lg">
                <Navbar.Brand href="#home" className="mr-3">Junglex</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        {/* Puedes agregar elementos específicos para comercios aquí */}
                    </Nav>
                    <Dropdown className="ml-3">
                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                            <BsPersonFill />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item disabled>{user.email}</Dropdown.Item>
                            <Dropdown.Item onClick={() => onViewChange('Comprar')}>Comprar</Dropdown.Item>
                            <Dropdown.Item onClick={() => onViewChange('Pedidos')}>Pedidos Pendientes</Dropdown.Item>
                            <Dropdown.Item onClick={() => onViewChange('HistorialPedidos')}>Historial de pedidos</Dropdown.Item>
                            <Dropdown.Item onClick={() => onViewChange('Config')}>Configuración del comercio</Dropdown.Item>
                            <Dropdown.Item onClick={() => onViewChange('Products')}>Productos</Dropdown.Item>
                            <Dropdown.Item onClick={() => setShowLocationForm(true)}>Agregar Ubicación</Dropdown.Item>
                            <Dropdown.Item onClick={signOut}>Cerrar sesión</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Navbar.Collapse>
            </Navbar>

            <UserLocationForm
                userId={user?.id}
                show={showLocationForm}
                handleClose={() => setShowLocationForm(false)}
                handleSave={handleSaveLocation}
            />
        </>
    );
};

export default HeaderComercio;
