import { useQuery } from '@tanstack/react-query';
import ky from 'ky';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';

const Provider = AuthContext.Provider;

export function AuthProvider({ children }) {
  const { status, error, data } = useQuery({
    queryKey: ['auth'],
    queryFn: () => ky.get('/api/me', { timeout: 5000, redirect: 'manual' }).json(),
  });
  const [authInfo, setAuthInfo] = useState({
    id: null,
    userData: {},
  });

  const isAuthenticated = () => data?.id !== undefined;
  const receiveNotifications = () => data?.userData?.receiveNotifications;
  const completeProfile = () => data?.userData?.profileComplete;
  const isElevated = () => data?.userData.access === 'elevated';

  useEffect(() => {
    if (status !== 'success' || error) {
      return;
    }

    setAuthInfo(data);
  }, [status, error, data]);

  return (
    <Provider
      value={{
        status,
        error,
        authInfo,
        isAuthenticated,
        isElevated,
        receiveNotifications,
        setAuthInfo,
        completeProfile,
      }}
    >
      {children}
    </Provider>
  );
}
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
