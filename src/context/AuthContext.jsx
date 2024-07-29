import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../supabase/supabase.config';

// Crear el contexto
const AuthContext = createContext();

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Comprobar si el usuario está autenticado al cargar la aplicación
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    fetchSession();

    // Suscribirse a los cambios en la autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    signInWithGoogle: async () => {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
        });
        if (error) throw error;
      } catch (error) {
        console.error('Error logging in with Google:', error.message);
      }
    },
    signOut: async () => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      } catch (error) {
        console.error('Error signing out:', error.message);
      }
    },
    registerAsComercio: async () => {
      if (!user) return;
  
      try {
        const { error } = await supabase
          .from('user_profiles')
          .upsert({ user_id: user.id, user_type: 'comercio' });
  
        if (error) throw error;
        console.log('Usuario registrado como comercio');
      } catch (error) {
        console.error('Error registering as comercio:', error.message);
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook para usar el contexto
export const useAuth = () => {
  return useContext(AuthContext);
};
