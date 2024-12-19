import React, { useEffect, useState } from "react";
import { Navbar, Nav, Button, Dropdown, Container } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import UserLocationForm from "./UserLocationForm";
import supabase from "../../supabase/supabase.config";
import AllCoinDropdown from "./AllCoinDropdown";

const Header = ({ user, selectedLocation, handleSelectLocation, handleComercioView }) => {
    const [userLocations, setUserLocations] = useState([]);
    const [showLocationForm, setShowLocationForm] = useState(false);
    const { signInWithGoogle, signOut } = useAuth();

    // Cargar ubicaciones del usuario
    useEffect(() => {
        const fetchUserLocations = async () => {
            // Solo buscar ubicaciones si el usuario es de tipo 'cliente'
            if (!user || user.user_data?.user_type !== 'cliente') {
                setUserLocations([]);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from("user_locations")
                    .select("*")
                    .eq("user_id", user.id);

                if (error) throw error;

                if (data.length > 0) {
                    setUserLocations(data);
                    
                    // Solo llamar a handleSelectLocation para clientes
                    if (handleSelectLocation) {
                        handleSelectLocation(data[0]);
                    }
                } else {
                    setUserLocations([]);
                    console.log("No se encontraron ubicaciones para el usuario.");
                }
            } catch (error) {
                console.error("Error al obtener ubicaciones:", error.message);
            }
        };

        fetchUserLocations();
    }, [user, handleSelectLocation]);

    // Guardar nueva ubicación
    const handleSaveLocation = async (address, position) => {
        const newLocation = {
            address,
            latitude: position.lat,
            longitude: position.lng,
            user_id: user.id,
        };

        // Validar si la ubicación ya existe
        const exists = userLocations.some(
            (location) => location.address === address
        );
        if (exists) {
            alert("Esta ubicación ya existe.");
            return;
        }

        try {
            const { error } = await supabase.from("user_locations").insert([newLocation]);

            if (error) throw error;

            setUserLocations((prevLocations) => [...prevLocations, newLocation]);
            handleSelectLocation(newLocation);
            setShowLocationForm(false);
        } catch (error) {
            console.error("Error al guardar la ubicación:", error.message);
            alert("Error al guardar la ubicación.");
        }
    };

    return (
        <>
            <Navbar bg="light" expand="lg">
                <Container>
                    {/* Logo y nombre */}
                    <div className="d-flex align-items-center position-absolute start-0 ms-3">
                        <img
                            src="/favicon.ico"
                            alt="Junglex Logo"
                            style={{ width: "30px", height: "30px", marginRight: "10px" }}
                        />
                        <Navbar.Brand href="#home">Junglex</Navbar.Brand>
                    </div>

                    {/* Botón de login/Dropdown */}
                    <div className="d-flex justify-content-center w-100">
                        {!user ? (
                            <Button
                                variant="outline-success"
                                className="login-button-blink"
                                onClick={signInWithGoogle}
                            >
                                Inicie sesión para comprar y vender en Junglex
                            </Button>
                        ) : (
                            <Navbar.Collapse id="basic-navbar-nav" className="justify-content-center">
                                <Nav className="align-items-center">
                                    {/* Manejo de ubicaciones */}
                                    {user.user_data?.user_type === "cliente" && (
                                        <>
                                            {userLocations.length > 0 ? (
                                                <Dropdown className="ms-2">
                                                    <Dropdown.Toggle variant="success" id="dropdown-basic">
                                                        {selectedLocation
                                                            ? selectedLocation.address
                                                            : "Selecciona una ubicación"}
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        {userLocations.map((location) => (
                                                            <Dropdown.Item
                                                                key={location.id}
                                                                onClick={() => handleSelectLocation(location)}
                                                            >
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
                                                <Button
                                                    variant="outline-success"
                                                    onClick={() => setShowLocationForm(true)}
                                                >
                                                    Agregar dirección
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </Nav>
                                {/* Dropdown para monedas */}
                                <AllCoinDropdown />
                                {/* Botón de logout */}
                                <Button className="btn btn-danger ms-2" onClick={signOut}>
                                    Cerrar sesión
                                </Button>
                            </Navbar.Collapse>
                        )}
                    </div>
                </Container>
            </Navbar>

            {/* Formulario para agregar ubicación */}
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
