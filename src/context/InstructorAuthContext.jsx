import { createContext, useContext, useState, useEffect } from 'react';

const InstructorAuthContext = createContext();

export const InstructorAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if already authenticated
    const authStatus = sessionStorage.getItem('instructor-authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = (password) => {
    if (password === 'microbiology2024') {
      setIsAuthenticated(true);
      sessionStorage.setItem('instructor-authenticated', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('instructor-authenticated');
  };

  return (
    <InstructorAuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </InstructorAuthContext.Provider>
  );
};

export const useInstructorAuth = () => {
  const context = useContext(InstructorAuthContext);
  if (!context) {
    throw new Error('useInstructorAuth must be used within an InstructorAuthProvider');
  }
  return context;
};
