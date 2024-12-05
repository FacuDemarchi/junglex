import React, {useState, useCallback, useEffect} from 'react';
import { useAuth } from './context/AuthContext';
import ComercioView from './components/comercio/ComercioView';
import ClientView from './components/client/ClientView';
import NoLoginView from './components/noLogedIn/NoLoginView';
import supabase from './supabase/supabase.config';

const App = () => {
    const { user, signInWithGoogle } = useAuth();
    const [comercioView, setComercioView] = useState('MisPedidos');
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [monedas, setMonedas] = useState([]);
    const [selectedMoneda, setSelectedMoneda] = useState('ARS');

    const handleSelectLocation = useCallback((location) => {
        setSelectedLocation(location);
    }, []);

    const handleComercioView = (view) => {
        setComercioView(view)
    };

    const handleMoneda = (SelectCurrency) => {
        setSelectedMoneda(SelectCurrency)
    };

    useEffect(() => {
        const fetchMonedas = async () => {
            try {
                const { data, error } = await supabase
                    .from('monedas')
                    .select('*');
                if (error) throw error;
                setMonedas(data);
            } catch (error) {
                console.error('Error al obtener las monedas:', error.message);
            }
        };

        fetchMonedas();
    }, []);

    const userType = user?.user_data ? user.user_data.user_type : null;

    return (
        <div className='container'>
            {user ? (
                userType === 'cliente' ? (
                    <ClientView 
                        user={user} 
                        selectedLocation={selectedLocation} 
                        handleSelectLocation={handleSelectLocation} 
                        handleMoneda={handleMoneda} 
                        monedas={monedas} 
                        selectedMoneda={selectedMoneda} 
                    />
                ) : userType === 'comercio' ? (
                    <ComercioView 
                        user={user} 
                        currentView={comercioView} 
                        handleComercioView={handleComercioView} 
                        monedas={monedas} 
                        selectedMoneda={selectedMoneda} 
                        handleMoneda={handleMoneda} 
                    />
                ) : (
                    <NoLoginView signInWithGoogle={signInWithGoogle} />
                )
            ) : (
                <NoLoginView signInWithGoogle={signInWithGoogle} />
            )}
        </div>
    );
};

export default App;
