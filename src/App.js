import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ComercioView from './components/comercio/ComercioView';
import ClientView from './components/client/ClientView';
import Index from './components/noLogedIn/Index.jsx';
import TestComponent from './components/testingFuncitions/TestComponent';

// Componente para la vista temporal de cliente
const ClienteTemp = () => {
    const { user } = useAuth();
    const [selectedLocation, setSelectedLocation] = useState(null);

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
        />
    );
};

const App = () => {
    const { user } = useAuth();
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
                            <Index/>
                        )
                    ) : (
                        <Index/>
                    )
                } />
                {/* Nueva ruta para vista de cliente temporal */}
                <Route path="/vista-cliente" element={<ClienteTemp />} />
                <Route path="/test" element={<TestComponent />} />
            </Routes>
        </Router>
    );
};

export default App;
