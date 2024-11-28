import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Button, Dropdown, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import UserLocationForm from './UserLocationForm';
import supabase from '../../supabase/supabase.config';
import { BsPersonFill } from "react-icons/bs";

const Header = ({ user, selectedLocation, handleSelectLocation, handleComercioView }) => {
    const [userLocations, setUserLocations] = useState([]);
    const [showLocationForm, setShowLocationForm] = useState(false);
    const { signInWithGoogle, signOut } = useAuth();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUserLocations = async () => {
            try {
                const { data, error } = await supabase
                    .from('user_locations')
                    .select('*')
                    .eq('user_id', user.id);

                if (error) throw error;

                if (data && data.length > 0) {
                    handleSelectLocation(data[0]);
                }
            } catch (error) {
                console.error('Error al obtener ubicaciones:', error);
            }
        };

        fetchUserLocations();
    }, [user]);

    const handleSaveLocation = async (address, position) => {
        const newLocation = { address, latitude: position.lat, longitude: position.lng, user_id: user.id };
        const exists = userLocations.some(location => location.address === address);

        if (exists) {
            alert('Esta ubicación ya existe.');
            return;
        }

        const { error } = await supabase
            .from('user_locations')
            .insert([newLocation]);

        if (error) {
            console.error('Error saving new location:', error.message);
            alert('Error al guardar la ubicación.');
        } else {
            setUserLocations([...userLocations, newLocation]);
            handleSelectLocation(newLocation);
            setShowLocationForm(false);
        }
    };

    return (
        <>
            <Navbar bg="light" expand="lg">
                <Navbar.Brand href="#home" className="mr-3">Junglex</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                {user ? (
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="mr-auto">
                            {loading ? (
                                <Spinner animation="border" variant="primary" />
                            ) : userLocations.length > 0 ? (
                                <Dropdown>
                                    <Dropdown.Toggle variant="success" id="dropdown-basic">
                                        {selectedLocation ? selectedLocation.address : 'Selecciona una ubicación'}
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                        {userLocations.map((location) => (
                                            <Dropdown.Item key={location.id} onClick={() => handleSelectLocation(location)}>
                                                {location.address}
                                            </Dropdown.Item>
                                        ))}
                                        <Dropdown.Divider />
                                        <Dropdown.Item onClick={() => setShowLocationForm(true)}>
                                            Agregar nueva dirección
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            ) : (
                                <Button variant="outline-success" onClick={() => setShowLocationForm(true)}>
                                    Agregar dirección
                                </Button>
                            )}
                        </Nav>
                        <Dropdown className="ml-3">
                            <Dropdown.Toggle variant="success" id="dropdown-basic">
                                <BsPersonFill />
                            </Dropdown.Toggle>
                            {user.user_data.user_type === 'comercio' ? (
                                <Dropdown.Menu> {/*Dropdown para comercios*/}
                                    <Dropdown.Item onClick={() => handleComercioView('Comprar')} href="#Comprar">Comprar</Dropdown.Item>
                                    <Dropdown.Item onClick={() => handleComercioView('MisPedidos')} href="#MisPedidos">Mis Pedidos</Dropdown.Item>
                                    <Dropdown.Item onClick={() => handleComercioView('HistorialPedidos')} href="#HistorialPedidos">Historial de pedidos</Dropdown.Item>
                                    <Dropdown.Item onClick={() => handleComercioView('Config')} href="#Config">Configuración del comercio</Dropdown.Item>
                                    <Dropdown.Item onClick={() => handleComercioView('Products')} href="#Products">Mis Productos</Dropdown.Item>
                                    <Dropdown.Item onClick={signOut}>Cerrar sesión</Dropdown.Item>
                                </Dropdown.Menu>
                            ) : (
                                <Dropdown.Menu> {/*Dropdown para clientes*/}
                                    <Dropdown.Item onClick={signOut}>Cerrar sesión</Dropdown.Item>
                                </Dropdown.Menu>
                            )}
                        </Dropdown>
                    </Navbar.Collapse>
                ) : (
                    <Button variant="outline-success" className="ml-3" onClick={signInWithGoogle}>
                        Iniciar sesión con Google
                    </Button>
                )}
            </Navbar>

            <UserLocationForm
                user={user}
                show={showLocationForm}
                handleClose={() => setShowLocationForm(false)}
                handleSave={handleSaveLocation}
            />
        </>
    );
};

export default Header;
