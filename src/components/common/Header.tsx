import React, { useEffect, useState } from "react";
import { Navbar, Nav, Button, Dropdown, Container } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import UserLocationForm from "./UserLocationForm";
import supabase from "../../supabase/supabase.config";
import AllCoinDropdown from "./AllCoinDropdown";
import { Link } from "react-router-dom";
import styles from "./styles/Header.module.css";

interface UserLocation {
    id: string;
    address: string;
    latitude: number;
    longitude: number;
    user_id: string;
}

interface User {
    id: string;
    user_data?: {
        user_type: string;
    };
}

interface HeaderProps {
    user: User | null;
    selectedLocation: UserLocation | null;
    handleSelectLocation: (location: UserLocation) => void;
    handleComercioView?: (comercio: any) => void;
    isTemporaryView?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
    user, 
    selectedLocation, 
    handleSelectLocation, 
    handleComercioView, 
    isTemporaryView = false 
}) => {
    const [userLocations, setUserLocations] = useState<UserLocation[]>([]);
    const [showLocationForm, setShowLocationForm] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { signInWithGoogle, signOut } = useAuth();

    useEffect(() => {
        const fetchUserLocations = async () => {
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
                    
                    if (handleSelectLocation) {
                        handleSelectLocation(data[0]);
                    }
                } else {
                    setUserLocations([]);
                    console.log("No se encontraron ubicaciones para el usuario.");
                }
            } catch (error) {
                console.error("Error al obtener ubicaciones:", error);
            }
        };

        fetchUserLocations();
    }, [user, handleSelectLocation]);

    const handleSaveLocation = async (address: string, position: { latitude: number; longitude: number }) => {
        if (!user) return; // Asegúrate de que user no sea null

        try {
            const { data, error } = await supabase
                .from('user_locations')
                .insert([
                    { user_id: user.id, address: address, latitude: position.latitude, longitude: position.longitude }
                ])
                .select();

            if (error) throw error;
            
            if (data && data.length > 0) {
                const newLocation = data[0];
                setUserLocations(prev => [...prev, newLocation]);
                handleSelectLocation(newLocation);
            }
            setShowLocationForm(false);
        } catch (error) {
            console.error("Error al guardar ubicación:", error);
            alert("Error al guardar la ubicación. Por favor, intenta nuevamente.");
        }
    };

    return (
        <>
            <Navbar className={styles.navbar} expand="lg">
                <Container className={styles.container}>
                    <div className={styles.logoContainer}>
                        {isTemporaryView ? (
                            <Link to="/" className={styles.brand}>
                                <img
                                    src="/favicon.ico"
                                    alt="Junglex Logo"
                                    className={styles.logo}
                                />
                                <span>Junglex</span>
                            </Link>
                        ) : (
                            <>
                                <img
                                    src="/favicon.ico"
                                    alt="Junglex Logo"
                                    className={styles.logo}
                                />
                                <Navbar.Brand className={styles.brand}>Junglex</Navbar.Brand>
                            </>
                        )}
                    </div>

                    {user && (
                        <button
                            className={styles.menuToggle}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle navigation"
                        >
                            <span className={styles.hamburgerIcon}></span>
                            <span className={styles.hamburgerIcon}></span>
                            <span className={styles.hamburgerIcon}></span>
                        </button>
                    )}

                    <div className={`${styles.centerContent} ${isMenuOpen ? styles.menuOpen : ''}`}>
                        {!user ? (
                            <Button
                                variant="outline-success"
                                className={styles.loginButton}
                                onClick={signInWithGoogle}
                            >
                                Inicie sesión para comprar y vender en Junglex
                            </Button>
                        ) : (
                            <div className={styles.navLinksContainer}>
                                <Nav className={styles.navLinks}>
                                    {isTemporaryView && (
                                        <div className={styles.tempViewBadge}>
                                            Vista temporal de cliente
                                        </div>
                                    )}
                                    
                                    {user.user_data?.user_type === "cliente" && (
                                        <>
                                            {userLocations.length > 0 ? (
                                                <Dropdown className={styles.locationDropdown}>
                                                    <Dropdown.Toggle 
                                                        variant="success" 
                                                        id="dropdown-basic"
                                                        className={styles.locationButton}
                                                    >
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
                                                    className={styles.locationButton}
                                                    onClick={() => setShowLocationForm(true)}
                                                >
                                                    Agregar dirección
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </Nav>
                                <AllCoinDropdown />
                                <Button 
                                    className={styles.logoutButton} 
                                    onClick={signOut}
                                >
                                    Cerrar sesión
                                </Button>
                            </div>
                        )}
                    </div>
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