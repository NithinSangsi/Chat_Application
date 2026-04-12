import { createContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import socket from '../socket';

export const AuthContext = createContext();

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000' });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('lets-chat-token', token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      localStorage.removeItem('lets-chat-token');
      delete api.defaults.headers.common.Authorization;
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('lets-chat-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('lets-chat-user');
    }
  }, [user]);

  const loginUser = async ({ email, password }) => {
    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', { email, password });
      setUser(response.data.user);
      setToken(response.data.token);
      return response.data;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async ({ name, email, password, description, profilePic }) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('description', description || '');
      if (profilePic) formData.append('profilePic', profilePic);
      const response = await api.post('/api/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser(response.data.user);
      setToken(response.data.token);
      return response.data;
    } finally {
      setLoading(false);
    }
  };

  const requestOtp = async ({ phone, name }) => {
    setLoading(true);
    try {
      const response = await api.post('/api/auth/otp-request', { phone, name });
      return response.data;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async ({ phone, otp, name, description, profilePic }) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('phone', phone);
      formData.append('otp', otp);
      formData.append('name', name);
      formData.append('description', description || '');
      if (profilePic) formData.append('profilePic', profilePic);
      const response = await api.post('/api/auth/otp-verify', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser(response.data.user);
      setToken(response.data.token);
      return response.data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (user?.id) {
      socket.emit('user-offline', user.id);
    }
    setUser(null);
    setToken('');
  };

  const value = useMemo(
    () => ({ user, token, loading, loginUser, registerUser, requestOtp, verifyOtp, logout, api }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
