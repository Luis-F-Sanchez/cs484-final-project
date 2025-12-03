import { useEffect, useState } from "react";

// =============================================================================
// This file manages the session token in component state and syncs it with local
// storage. 
// =============================================================================

export function useSessionToken() {
    // initial state: pulls sessionToken from local storage synchronously, if the
    // session token does not exist yet, it starts as null
    const [token, setToken] = useState<string | null>(() => {
        if (typeof window === "undefined") return null;
        return localStorage.getItem("sessionToken");
    });

    // runs once, if the state is still null, it rereads local storage and sets the token
    useEffect(() => {
        if (token !== null) return;
        const stored = localStorage.getItem("sessionToken");
        if (stored) setToken(stored);
    }, []);

    // updates state and writes to local storage
    const saveToken = (next: string) => {
        setToken(next);
        localStorage.setItem("sessionToken", next);
    };

    // clears state and removes from local storage
    const clearToken = () => {
        setToken(null);
        localStorage.removeItem("sessionToken");
    };

    // returns the three functions for components to use
    // doing this avoids reimplementing token storage on each page
    return { token, saveToken, clearToken };
}
