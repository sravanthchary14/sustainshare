import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    if (token && userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  const login = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('userData', JSON.stringify(userData));
    if (userData.token) {
      localStorage.setItem('authToken', userData.token);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    sessionStorage.clear();
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      setCurrentUser,
      login,
      logout,
      currentCharity: currentUser?.role === 'charity' ? currentUser : null
    }}>
      {children}
    </AuthContext.Provider>
  );
};
