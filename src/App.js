import React, { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import supabase from './supabase/supabase.config';
import ComercioView from './components/comercio/ComercioView';
import ClientView from './components/client/ClientView';
import UnknownUser from './components/noLogedIn/UnknownUser'

const App = () => {
    const { user, signInWithGoogle } = useAuth();
    const [userComercio, setUserComercio] = useState(null);

    useEffect(() => {
        if (user) {
            async function checkUserComercio() {
                const { data, error } = await supabase
                    .from('comercios')
                    .select()
                    .eq('id', user.id);

                if (error) {
                    console.error('Error checking user comercio:', error);
                    return;
                }

                setUserComercio(data.length > 0);
            }
            checkUserComercio();
        }
    }, [user]);

    return (
        <>
            {user ? (
                userComercio ? (
                    <ComercioView user={user}/>
                ) : (
                    <ClientView user={user}/>
                )
            ) : (
                <UnknownUser signInWithGoogle={signInWithGoogle}/>
            )}
        </>
    );
};

export default App;
