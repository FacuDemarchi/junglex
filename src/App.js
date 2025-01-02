import React, {useState, useCallback} from 'react';
import { useAuth } from './context/AuthContext';
import ComercioView from './components/comercio/ComercioView';
import ClientView from './components/client/ClientView';
import NoLoginView from './components/noLogedIn/NoLoginView';

const App = () => {
    const { user, signInWithGoogle } = useAuth();
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
        <div className='container'>
            {user ? (
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
                    <NoLoginView signInWithGoogle={signInWithGoogle} />
                )
            ) : (
                <NoLoginView signInWithGoogle={signInWithGoogle} />
            )}
        </div>
    );
};

export default App;
