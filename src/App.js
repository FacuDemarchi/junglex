import React, {useState, useCallback} from 'react';
import { useAuth } from './context/AuthContext';
import ComercioView from './components/comercio/ComercioView';
import ClientView from './components/client/ClientView';
import NoLoginView from './components/noLogedIn/NoLoginView';
import Header from './components/common/Header';

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

    if (!user) {
        return <NoLoginView signInWithGoogle={signInWithGoogle} />;
    }

    const userType = user.user_data ? user.user_data.user_type : null;

    switch (userType) {
        case 'cliente':
            return (
                <div className='container'>
                    <Header user={user} selectedLocation={selectedLocation} handleSelectLocation={handleSelectLocation} />
                    <ClientView user={user} selectedLocation={selectedLocation} />
                </div>
            );
        case 'comercio':
            return <div className='container'>
                <Header user={user} handleComercioView={handleComercioView} selectedLocation={selectedLocation} handleSelectLocation={handleSelectLocation} />
                <ComercioView user={user} currentView={comercioView} />
            </div>;
        default:
            return <NoLoginView signInWithGoogle={signInWithGoogle} />;
    }
};

export default App;
