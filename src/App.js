import React from 'react';
import { useAuth } from './context/AuthContext';
import ComercioView from './components/comercio/ComercioView';
import ClientView from './components/client/ClientView';
import NoLoginView from './components/noLogedIn/NoLoginView';

const App = () => {
    const { user, signInWithGoogle } = useAuth();

    if (!user) {
        return <NoLoginView signInWithGoogle={signInWithGoogle} />;
    }

    switch (user.user_type) {
        case 'cliente':
            return <ClientView user={user} />;
        case 'comercio':
            return <ComercioView user={user} />;
        default:
            return <NoLoginView signInWithGoogle={signInWithGoogle} />;
    }
};

export default App;
