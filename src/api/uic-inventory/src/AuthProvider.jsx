import { useQuery, MeQuery } from './components/GraphQL';
import { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext();
const Provider = AuthContext.Provider;

export function AuthProvider({ children }) {
  const { loading, error, data } = useQuery(MeQuery);
  const [authInfo, setAuthInfo] = useState({
    id: null,
    userData: {},
  });

  const isAuthenticated = () => authInfo.id !== null;
  const receiveNotifications = () => authInfo.userData.receiveNotifications;
  const completeProfile = () => authInfo.userData.profileComplete;

  useEffect(() => {
    if (loading || error) {
      return;
    }

    setAuthInfo({
      id: data.me.id,
      userData: { ...data.me },
    });
  }, [loading, error, data]);

  return (
    <Provider value={{ error, authInfo, isAuthenticated, receiveNotifications, setAuthInfo, completeProfile }}>
      {children}
    </Provider>
  );
}
