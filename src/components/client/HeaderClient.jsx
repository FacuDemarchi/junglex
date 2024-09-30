import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Dropdown } from 'react-bootstrap';
import UserLocationForm from './UserLocationForm';
import supabase from '../../supabase/supabase.config';
import { BsPersonFill } from "react-icons/bs";
import { useAuth } from '../../context/AuthContext';

const HeaderClient = ({ user, onSelectLocation }) => {
    const [userLocations, setUserLocations] = useState([]);
    const [showLocationForm, setShowLocationForm] = useState(false);
    const { signOut } = useAuth();

    useEffect(() => {
        async function fetchUserData() {
            if (user) {
                // Obtener ubicaciones del usuario
                const { data: locationsData, error: locationsError } = await supabase
                    .from('user_locations')
                    .select()
                    .eq('user_id', user.id);

                if (locationsError) {
                    console.error('Error fetching user locations:', locationsError.message);
                }

                if (locationsData && locationsData.length > 0) {
                    setUserLocations(locationsData);
                    onSelectLocation(locationsData[0]);
                } else {
                    setShowLocationForm(true);
                }
            }
        }

        fetchUserData();
    }, [user, onSelectLocation]);

    const handleSaveLocation = async (address, position) => {
        const newLocation = { address, latitude: position.lat, longitude: position.lng, user_id: user.id };
        
        // Guardar nueva ubicación
        const { error: locationError } = await supabase
            .from('user_locations')
            .insert([newLocation]);

        if (locationError) {
            console.error('Error saving new location:', locationError.message);
        } else {
            setUserLocations([...userLocations, newLocation]);
            onSelectLocation(newLocation);
            setShowLocationForm(false);
        }
    };

    return (
        <>
            <Navbar bg="light" expand="lg">
                <Navbar.Brand href="#home" className="mr-3">Junglex</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
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
                    <Dropdown className="ml-3">
                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                            <BsPersonFill />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item disabled>{user.email}</Dropdown.Item>
                            <Dropdown.Item onClick={signOut}>Cerrar sesión</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Navbar.Collapse>
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

export default HeaderClient;
