import React, { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import supabase from './supabase/supabase.config';
import { Button } from 'react-bootstrap';
import ComercioView from './components/comercio/ComercioView';
import ClientView from './components/client/ClientView';

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
                <div className="container mt-5">
                    <Button variant="outline-success" className="ml-3" onClick={signInWithGoogle}>
                        Iniciar sesión con Google
                    </Button>
                    <p>Inicie sesión para encontrar a los comercios que llegan hasta su ubicación!</p>
                    <p>Esta sección es para mostrar información del proyecto, sus objetivos e incentivar el registro de todos los comercios a la plataforma</p>
                </div>
            )}
        </>
    );
};

export default App;
