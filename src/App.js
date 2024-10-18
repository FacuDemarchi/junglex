import React from 'react';
import { useAuth } from './context/AuthContext';
import ComercioView from './components/comercio/ComercioView';
import ClientView from './components/client/ClientView';
import UnknownUser from './components/noLogedIn/UnknownUser';

const App = () => {
    const { user, signInWithGoogle } = useAuth();

    if (!user) {
        return <UnknownUser signInWithGoogle={signInWithGoogle} />;
    }

    switch (user.user_type) {
        case 'cliente':
            return <ClientView user={user} />;
        case 'comercio':
            return <ComercioView user={user} />;
        default:
            return <UnknownUser signInWithGoogle={signInWithGoogle} />;
    }
};

export default App;
