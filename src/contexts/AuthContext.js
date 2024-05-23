import React, { useContext, useState, useEffect, createContext } from 'react';
import { auth } from '../firebase-config';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe; // cleanup function
    }, []);

    const value = {
        currentUser,
        // Burada auth fonksiyonları ekleyebilirsiniz, örneğin signup, login, logout vs.
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
