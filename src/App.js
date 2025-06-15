import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import supabase from './supabase/supabase.config';
import RegistroComercio from './components/common/RegistroComercio';
import NoLogedIn from './pages/NoLogedIn';
import Client from './pages/Client';
import Comercio from './pages/Comercio';
import './App.css';

function App() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <Router>
            <Routes>
                <Route path="/" element={user ? <Navigate to="/client" /> : <NoLogedIn />} />
                <Route path="/client/*" element={user ? <Client currentView="pedidos" /> : <Navigate to="/" />} />
                <Route path="/comercio/*" element={user ? <Comercio currentView="pedidos" /> : <Navigate to="/" />} />
                <Route path="/registro-comercio" element={user ? <RegistroComercio /> : <Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
