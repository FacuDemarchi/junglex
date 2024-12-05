import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Button, Dropdown, Container } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import UserLocationForm from './UserLocationForm';
import supabase from '../../supabase/supabase.config';
import { useCoin } from '../../context/CoinContext';

const Header = ({ user, selectedLocation, handleSelectLocation, handleComercioView }) => {
    const [userLocations, setUserLocations] = useState([]);
    const [showLocationForm, setShowLocationForm] = useState(false);
    const { signInWithGoogle, signOut } = useAuth();
    const { allCoin = [], currency, setCurrency } = useCoin();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCoins = allCoin.filter(coin =>
        coin.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                                    <Dropdown className='ms-2'>
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
                            <Dropdown className='ms-2'>
                                <Dropdown.Toggle variant="success" id="dropdown-basic">
                                    <img src={currency.image} alt={currency.name} style={{ width: '20px', height: '20px', marginRight: '5px' }} />
                                    {currency.name}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <input
                                        type="text"
                                        placeholder="Buscar moneda..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ margin: '10px', padding: '5px', width: '90%' }}
                                    />
                                    {Array.isArray(filteredCoins) && filteredCoins.length > 0 ? (
                                        filteredCoins.map((coin) => (
                                            <Dropdown.Item key={coin.id} onClick={() => setCurrency(coin)}>
                                                <img src={coin.image} alt={coin.name} style={{ width: '20px', height: '20px', marginRight: '5px' }} />
                                                {coin.name}
                                            </Dropdown.Item>
                                        ))
                                    ) : (
                                        <Dropdown.Item disabled>No hay monedas disponibles</Dropdown.Item>
                                    )}
                                </Dropdown.Menu>
                            </Dropdown>
                            <button className="btn btn-danger ms-2" onClick={signOut}>Cerrar sesión</button>
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
