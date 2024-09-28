import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Button, Dropdown } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import UserLocationForm from '../client/UserLocationForm';
import supabase from '../../supabase/supabase.config';
import { BsPersonFill } from "react-icons/bs";

const Header = ({ user, onSelectLocation, userComercio }) => {
    const [userLocations, setUserLocations] = useState([]);
    const [showLocationForm, setShowLocationForm] = useState(false);
    const { signInWithGoogle, signOut } = useAuth();

    useEffect(() => {
        async function fetchUserLocations() {
            if (user) {
                console.log('Fetching user locations for user:', user);
                const { data: locationsData, error } = await supabase
                    .from('user_locations')
                    .select()
                    .eq('user_id', user.id);

                if (error) {
                    console.error('Error fetching user locations:', error.message);
                }

                if (locationsData && locationsData.length > 0) {
                    setUserLocations(locationsData);
                    onSelectLocation(locationsData[0]); // Pasar la primera ubicación seleccionada por defecto
                } else {
                    setShowLocationForm(true);
                }
            }
        }

        fetchUserLocations();
    }, [user, onSelectLocation]);

    const handleSaveLocation = async (address, position) => {
        const newLocation = { address, latitude: position.lat, longitude: position.lng, user_id: user.id };
        const { error } = await supabase
            .from('user_locations')
            .insert([newLocation]);

        if (error) {
            console.error('Error saving new location:', error.message);
        } else {
            setUserLocations([...userLocations, newLocation]);
            onSelectLocation(newLocation); // Seleccionar la nueva ubicación guardada
            setShowLocationForm(false);
        }
    };

    return (
        <>
            <Navbar bg="light" expand="lg">
                <Navbar.Brand href="#home" className="mr-3">Junglex</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                {(user) ? (
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="mr-auto">
                            {!userComercio && userLocations.length > 0 && (
                                <Dropdown>
                                    <Dropdown.Toggle variant="success" id="dropdown-basic">
                                        {userLocations[0].address}
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                        {userLocations.map((location, index) => (
                                            <Dropdown.Item key={index} onClick={() => onSelectLocation(location)}>
                                                {location.address}
                                            </Dropdown.Item>
                                        ))}
                                        <Dropdown.Divider />
                                        <Dropdown.Item onClick={() => setShowLocationForm(true)}>
                                            Agregar nueva dirección
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            )}
                        </Nav>
                        <>
                            <Dropdown className="ml-3">
                                <Dropdown.Toggle variant="success" id="dropdown-basic">
                                    <BsPersonFill />
                                </Dropdown.Toggle>
                                {userComercio ? (
                                    <Dropdown.Menu> {/*Dropdown para comercios*/}
                                        <Dropdown.Item href="#comprar">Comprar</Dropdown.Item>
                                        <Dropdown.Item href="#MisPedidos">Mis Pedidos</Dropdown.Item>
                                        <Dropdown.Item href="#HistorialPedidos">Historial de pedidos</Dropdown.Item>
                                        <Dropdown.Item onClick={signOut}>Cerrar sesión</Dropdown.Item>
                                    </Dropdown.Menu>
                                ) : (
                                    <Dropdown.Menu> {/*Dropdown para clientes*/}
                                        <Dropdown.Item onClick={signOut}>Cerrar sesión</Dropdown.Item>
                                    </Dropdown.Menu>
                                )}
                            </Dropdown>
                        </>
                    </Navbar.Collapse>
                ) : (
                    <Button variant="outline-success" className="ml-3" onClick={signInWithGoogle}>
                        Iniciar sesión con Google
                    </Button>
                )}

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

export default Header;
