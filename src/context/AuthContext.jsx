import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../supabase/supabase.config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async (user) => {
      try {
        const { data, error } = await supabase
          .from('user_data')
          .select('phone, user_type')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching phone data:', error);
          return;
        }

        if (data && data.length > 0) {
          const userWithPhone = { ...user, phone: data[0].phone, user_type: data[0].user_type };
          setUser(userWithPhone);
        } else {
          setUser(user); 
        }
      } catch (error) {
        console.error('Error in fetchUserData:', error);
      }
    };

    const fetchSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error fetching session:', error.message);
          return;
        }
        if (session) {
          fetchUserData(session.user);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };

    fetchSession(); 

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchUserData(session.user); 
      }
    });

    return () => {
      authListener?.subscription.unsubscribe(); 
    };
  }, []);

  const value = {
    user,
    signInWithGoogle: async () => {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
        });
        if (error) {
          console.error('Error logging in with Google:', error.message);
          return;
        }
      } catch (error) {
        console.error('Error logging in with Google:', error.message);
      }
    },
    signOut: async () => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Error signing out:', error.message);
        }
      } catch (error) {
        console.error('Error signing out:', error.message);
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook para usar el contexto
export const useAuth = () => {
  return useContext(AuthContext);
};
