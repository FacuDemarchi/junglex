import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ComercioView from './pages/Comercio';
import ClientView from './pages/Client';
import NoLogedInView from './pages/NoLogedIn';
import TestComponent from './components/testingFuncitions/TestComponent';
import RegistroComercio from './components/comercio/RegistroComercio';

// Componente para la vista temporal de cliente
const ClienteTemp = () => {
    const { user } = useAuth();
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [carritoVisible, setCarritoVisible] = useState(true);

    const handleSelectLocation = (location) => {
        setSelectedLocation(location);
    };

    // Si el usuario no está definido o no es un comercio, redirigimos a la ruta principal
    useEffect(() => {
        if (!user || user.user_data?.user_type !== 'comercio') {
            window.location.href = '/';
        }
    }, [user]);

    if (!user) return null;

    // Crear una copia del usuario con tipo cliente para renderizar la vista de cliente
    const clientUser = {
        ...user,
        user_data: {
            ...user.user_data,
            user_type: 'cliente'
        }
    };

    return (
        <ClientView 
            user={clientUser} 
            selectedLocation={selectedLocation} 
            handleSelectLocation={handleSelectLocation}
            isTemporaryView={true}
            carritoVisible={carritoVisible}
            setCarritoVisible={setCarritoVisible}
        />
    );
};

const App = () => {
    const { user } = useAuth();
    console.log('user_id: ', user);
    const [comercioView, setComercioView] = useState('MisPedidos');
    const [selectedLocation, setSelectedLocation] = useState(null);

    const handleSelectLocation = useCallback((location) => {
        setSelectedLocation(location);
    }, []);

    const handleComercioView = (view) => {
        setComercioView(view)
    };

    const userType = user?.user_data ? user.user_data.user_type : null;

    return (
        <Router>
            <Routes>
                <Route path="/" element={
                    user ? (
                        userType === 'cliente' ? (
                            <ClientView 
                                user={user} 
                                selectedLocation={selectedLocation} 
                                handleSelectLocation={handleSelectLocation}
                            />
                        ) : userType === 'comercio' ? (
                            <ComercioView 
                                user={user} 
                                currentView={comercioView} 
                                handleComercioView={handleComercioView} 
                            />
                        ) : (
                            <NoLogedInView/>
                        )
                    ) : (
                        <NoLogedInView/>
                    )
                } />
                {/* Nueva ruta para vista de cliente temporal */}
                <Route path="/vista-cliente" element={<ClienteTemp />} />
                <Route path="/test" element={<TestComponent />} />
                <Route path="/registro-comercio" element={<RegistroComercio />} />
            </Routes>
        </Router>
    );
};

export default App;
