import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('learnspace_token') || '');
  const [loading, setLoading] = useState(true);

  // Verify stored session on application boot
  useEffect(() => {
    async function initAuth() {
      const savedToken = localStorage.getItem('learnspace_token');
      if (!savedToken) {
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { 
            'Authorization': `Bearer ${savedToken}` 
          }
        });

        if (res.ok) {
          const userData = await res.json();
          setCurrentUser(userData);
          setToken(savedToken);
        } else {
          // Token expired or invalid: clear session
          localStorage.removeItem('learnspace_token');
          localStorage.removeItem('learnspace_user_id');
          setCurrentUser(null);
          setToken('');
        }
      } catch (err) {
        console.error('Session verification error:', err);
        localStorage.removeItem('learnspace_token');
        localStorage.removeItem('learnspace_user_id');
        setCurrentUser(null);
        setToken('');
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  // Real Database-driven Login
  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Invalid credentials');
    }

    // Persist session
    localStorage.setItem('learnspace_token', data.token);
    localStorage.setItem('learnspace_user_id', data.user.id);
    setToken(data.token);
    setCurrentUser(data.user);
    return data.user;
  };

  // Terminate session and audit trail
  const logout = async () => {
    const activeToken = token || localStorage.getItem('learnspace_token');
    if (activeToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${activeToken}` }
        });
      } catch (e) {
        // Continue clearing client session even if network drops
      }
    }

    localStorage.removeItem('learnspace_token');
    localStorage.removeItem('learnspace_user_id');
    setCurrentUser(null);
    setToken('');
  };

  return (
    <AuthContext.Provider value={{ currentUser, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}