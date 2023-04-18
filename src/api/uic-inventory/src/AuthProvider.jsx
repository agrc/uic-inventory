import { useQuery } from 'react-query';
import ky from 'ky';
import { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext();
const Provider = AuthContext.Provider;

export function AuthProvider({ children }) {
  const { status, error, data } = useQuery('auth', () =>
    ky.get('/api/me', { timeout: 5000, redirect: 'manual' }).json()
  );
  const [authInfo, setAuthInfo] = useState({
    id: null,
    userData: {},
  });

  const isAuthenticated = () => authInfo.id !== null;
  const receiveNotifications = () => authInfo.userData.receiveNotifications;
  const completeProfile = () => authInfo.userData.profileComplete;
  const isElevated = () => authInfo.userData.access === 'elevated';

  useEffect(() => {
    if (status !== 'success' || error) {
      return;
    }

    setAuthInfo(data);
  }, [status, error, data]);

  return (
    <Provider
      value={{ error, authInfo, isAuthenticated, isElevated, receiveNotifications, setAuthInfo, completeProfile }}
    >
      {children}
    </Provider>
  );
}
