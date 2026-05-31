import { useEffect, useState } from 'react';

const STORAGE_KEY = 'admin_password';

export function useAdminAuth() {
  const [password, setPassword] = useState(() => sessionStorage.getItem(STORAGE_KEY) || '');

  const login = (pwd) => {
    setPassword(pwd);
    sessionStorage.setItem(STORAGE_KEY, pwd);
  };

  const logout = () => {
    setPassword('');
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return { password, login, logout, isAuthenticated: !!password };
}
