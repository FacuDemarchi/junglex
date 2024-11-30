import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Button, Dropdown, Container } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import UserLocationForm from './UserLocationForm';
import supabase from '../../supabase/supabase.config';
import { BsPersonFill } from "react-icons/bs";

const Header = ({ user, selectedLocation, handleSelectLocation, handleComercioView, actualCurrency }) => {
    const [userLocations, setUserLocations] = useState([]);
    const [showLocationForm, setShowLocationForm] = useState(false);
    const { signInWithGoogle, signOut } = useAuth();

    useEffect(() => {
        const fetchUserLocations = async () => {
            try {
                const { data, error } = await supabase
                    .from('user_locations')
                    .select('*')
                    .eq('user_id', user.id);

                if (error) throw error;

                if (data && data.length > 0) {
                    setUserLocations(data);
                    handleSelectLocation(data[0]);
                } else {
                    console.log('No se encontraron ubicaciones para el usuario.');
                    setUserLocations([]);
                }
            } catch (error) {
                console.error('Error al obtener ubicaciones:', error);
            }
        };

        if (user) {
            fetchUserLocations();
        }
    }, [user, handleSelectLocation]);

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
                <Container>
                    <div className="d-flex align-items-center position-absolute start-0 ms-3">
                        <img 
                            src="/favicon.ico" 
                            alt="Junglex Logo" 
                            style={{ width: '30px', height: '30px', marginRight: '10px' }}
                        />
                        <Navbar.Brand href="#home">Junglex</Navbar.Brand>
                    </div>
                    
                    <div className="d-flex justify-content-center w-100">
                        <div className="text-center w-100">
                            {!user && (
                                <Button 
                                    variant="outline-success" 
                                    className="login-button-blink" 
                                    onClick={signInWithGoogle}
                                >
                                    Inicie sesión para comprar y vender en Junglex
                                </Button>
                            )}
                        </div>
                    </div>

                    {user && (
                        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-center">
                            <Nav className="align-items-center">
                                {user?.user_data?.user_type === 'cliente' && userLocations.length > 0 ? (
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
                                ) : user?.user_data?.user_type === 'cliente' ? (
                                    <Button variant="outline-success" onClick={() => setShowLocationForm(true)}>
                                        Agregar dirección
                                    </Button>
                                ) : null}
                            </Nav>
                            <Dropdown className="ml-3">
                                <Dropdown.Toggle variant="success" id="dropdown-basic">
                                    <BsPersonFill />
                                </Dropdown.Toggle>
                                {user.user_data.user_type === 'comercio' ? (
                                    <Dropdown.Menu> 
                                        <Dropdown.Item onClick={() => handleComercioView('Comprar')} href="#Comprar">Comprar</Dropdown.Item>
                                        <Dropdown.Item onClick={() => handleComercioView('MisPedidos')} href="#MisPedidos">Mis Pedidos</Dropdown.Item>
                                        <Dropdown.Item onClick={() => handleComercioView('HistorialPedidos')} href="#HistorialPedidos">Historial de pedidos</Dropdown.Item>
                                        <Dropdown.Item onClick={() => handleComercioView('Config')} href="#Config">Configuración del comercio</Dropdown.Item>
                                        <Dropdown.Item onClick={() => handleComercioView('Products')} href="#Products">Mis Productos</Dropdown.Item>
                                        <Dropdown.Item onClick={signOut}>Cerrar sesión</Dropdown.Item>
                                    </Dropdown.Menu>
                                ) : (
                                    <Dropdown.Menu> 
                                        <Dropdown.Item onClick={signOut}>Cerrar sesión</Dropdown.Item>
                                    </Dropdown.Menu>
                                )}
                            </Dropdown>
                        </Navbar.Collapse>
                    )}
                </Container>
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
