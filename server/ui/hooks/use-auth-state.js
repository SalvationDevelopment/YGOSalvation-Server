"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthStateContext = createContext(null);

function hasStoredSession() {
  return Boolean(typeof window !== "undefined" && window.localStorage?.session);
}

/**
 * Renders the Auth State Provider component and returns the UI used by the use auth state view.
 * @param {Object} props The props object supplies the structured input used by the use auth state module, including the `children` property.
 * @param {React.ReactNode} props.children The `children` property supplies structured input used by the use auth state module.
 * @returns {React.ReactNode} Returns the rendered UI used by the use auth state view.
 */
export function AuthStateProvider({ children }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [authResolved, setAuthResolved] = useState(false);

  useEffect(() => {
    function syncAuthState() {
      setLoggedIn(hasStoredSession());
      setAuthResolved(true);
    }

    function onStorage(event) {
      if (event.key && event.key !== "session") {
        return;
      }
      syncAuthState();
    }

    syncAuthState();
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const value = useMemo(
    () => ({
      authResolved,
      loggedIn,
      setLoggedIn(nextLoggedIn) {
        setLoggedIn(nextLoggedIn);
        setAuthResolved(true);
      },
    }),
    [authResolved, loggedIn],
  );

  return <AuthStateContext.Provider value={value}>{children}</AuthStateContext.Provider>;
}

/**
 * Uses auth state used by the use auth state module.
 * @returns {Object} Returns the value produced by the use auth state module.
 */
export function useAuthState() {
  const context = useContext(AuthStateContext);
  if (!context) {
    throw new Error("useAuthState must be used inside AuthStateProvider.");
  }
  return context;
}
