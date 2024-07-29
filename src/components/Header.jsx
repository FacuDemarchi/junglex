import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Button, Dropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import UserLocationForm from './UserLocationForm';
import supabase from '../supabase/supabase.config';

const Header = ({ user, onSelectLocation }) => {
    const [userLocations, setUserLocations] = useState([]);
    const [showLocationForm, setShowLocationForm] = useState(false);
    const { signInWithGoogle, signOut } = useAuth();

    useEffect(() => {
        async function fetchUserLocations() {
            if (user) {
                const { data: locationsData } = await supabase
                    .from('user_locations')
                    .select()
                    .eq('user_id', user.id);

                if (locationsData) {
                    setUserLocations(locationsData);
                    onSelectLocation(locationsData[0]); // Pasar la primera ubicación seleccionada por defecto
                } else {
                    setShowLocationForm(true);
                }
            }
        }

        fetchUserLocations();
    }, [user, onSelectLocation]);

    const handleSaveLocation = (address, position) => {
        const newLocation = { address, latitude: position.lat, longitude: position.lng };
        setUserLocations([...userLocations, newLocation]);
        onSelectLocation(newLocation); // Seleccionar la nueva ubicación guardada
        setShowLocationForm(false);
    };

    return (
        <>
            <Navbar bg="light" expand="lg">
                <Navbar.Brand href="#home">Mi App</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                {user ? (
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="mr-auto">
                            {userLocations.length > 0 && (
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
                            <Dropdown alignRight>
                                <Dropdown.Toggle variant="success" id="dropdown-basic">
                                    {user.email}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={signOut}>Cerrar sesión</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </>
                    </Navbar.Collapse>
                ) : (
                    <Button variant="outline-success" onClick={signInWithGoogle}>
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
