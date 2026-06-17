import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = '/api';

const getErrorMessage = (err) => {
  const detail = err.response?.data?.detail;
  if (!detail) {
    return err.message || 'An unexpected error occurred';
  }
  if (typeof detail === 'string') {
    return detail;
  }
  if (Array.isArray(detail)) {
    return detail.map(e => {
      const field = e.loc ? e.loc[e.loc.length - 1] : '';
      return `${field ? field.charAt(0).toUpperCase() + field.slice(1) + ': ' : ''}${e.msg}`;
    }).join(', ');
  }
  return JSON.stringify(detail);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('vastrasilai_token'));
  const [loading, setLoading] = useState(true);

  // Set default axios header
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${API_URL}/auth/me`);
        setUser(res.data);
      } catch (err) {
        console.error('Session expired or invalid token', err);
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchCurrentUser();
  }, [token]);

  const login = async (name, password, role) => {
    setLoading(true);
    try {
      console.log("Calling /auth/login with credentials:", { name, password, role });
      const res = await axios.post(`${API_URL}/auth/login`, { name, password, role });
      const data = res.data;
      console.log("Login API response:", data);
      
      localStorage.setItem('vastrasilai_token', data.access_token);
      localStorage.setItem('vastrasilai_role', data.role);
      localStorage.setItem('vastrasilai_name', data.name);
      localStorage.setItem('vastrasilai_lang', data.language);
      
      setToken(data.access_token);
      
      // Fetch user profile immediately
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
      const userRes = await axios.get(`${API_URL}/auth/me`);
      setUser(userRes.data);
      
      return userRes.data;
    } catch (err) {
      console.error("login error:", err);
      alert("Login failed: " + (err.response?.data?.detail || err.message || err));
      throw getErrorMessage(err);
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (name, phone, email, password, role, language, shopName = null, address = null, autoLogin = true) => {
    setLoading(true);
    try {
      const payload = { name, phone, password, role, language };
      if (email) payload.email = email;
      if (shopName) payload.shop_name = shopName;
      if (address) payload.address = address;
      
      console.log("Calling /auth/register with payload:", payload);
      const res = await axios.post(`${API_URL}/auth/register`, payload);
      console.log("Registration API response:", res.data);
      
      if (autoLogin) {
        console.log("Auto-logging in with:", phone, password, role);
        return await login(phone, password, role);
      }
      return res.data;
    } catch (err) {
      console.error("registerUser error:", err);
      alert("Registration failed: " + (err.response?.data?.detail || err.message || err));
      throw getErrorMessage(err);
    } finally {
      setLoading(false);
    }
  };

  const bypassLogin = async (role, nameOrPhone = null) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/bypass-login`, { role, name_or_phone: nameOrPhone });
      const data = res.data;
      
      localStorage.setItem('vastrasilai_token', data.access_token);
      localStorage.setItem('vastrasilai_role', data.role);
      localStorage.setItem('vastrasilai_name', data.name);
      localStorage.setItem('vastrasilai_lang', data.language);
      
      setToken(data.access_token);
      
      // Fetch user profile immediately
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
      const userRes = await axios.get(`${API_URL}/auth/me`);
      setUser(userRes.data);
      
      return userRes.data;
    } catch (err) {
      throw getErrorMessage(err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('vastrasilai_token');
    localStorage.removeItem('vastrasilai_role');
    localStorage.removeItem('vastrasilai_name');
    localStorage.removeItem('vastrasilai_lang');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await axios.put(`${API_URL}/auth/profile`, profileData);
      setUser(res.data);
      if (profileData.language) {
        localStorage.setItem('vastrasilai_lang', profileData.language);
      }
      return res.data;
    } catch (err) {
      throw getErrorMessage(err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, registerUser, bypassLogin, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export { API_URL };
