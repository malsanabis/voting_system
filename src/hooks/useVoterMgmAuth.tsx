import {  useEffect, useState } from 'react';
import { Navigate, useNavigate, Outlet } from 'react-router-dom';
import { voterMgmApi } from '../services/voterMgm.api';


export const useVoterMgmAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem('voterMgmt_token');
    const role = localStorage.getItem('user_role');

    if (token && role === 'staff') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    try {
      const result = await voterMgmApi.login(credentials);
      localStorage.setItem('voterMgmt_token', result.access_token);
      localStorage.setItem('user_role', 'staff');
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const logout = () => {
    localStorage.removeItem('voterMgmt_token');
    localStorage.removeItem('user_role');
    setIsAuthenticated(false);
    navigate('/voterMgmt-login');
  };

  return { isAuthenticated, isLoading, login, logout };
};

export const VoterMgmProtectedRoutes = () => {
  const { isAuthenticated, isLoading } = useVoterMgmAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d7b08e] mr-3"></div>
        <span className="text-xl font-semibold [direction:rtl]">جاري التحميل...</span>
      </div>
    );
  }

  console.log('VoterMgmProtectedRoutes → isAuthenticated:', isAuthenticated); // ✅ DEBUG

  return isAuthenticated ? <Outlet /> : <Navigate to="/voterMgmt-login" replace />;
};

