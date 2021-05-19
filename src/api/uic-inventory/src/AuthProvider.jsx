import { useQuery, MeQuery } from './components/GraphQL';

export const AuthContext = React.createContext();
const Provider = AuthContext.Provider;

export function AuthProvider({ children }) {
  const { loading, error, data } = useQuery(MeQuery);
  const [authInfo, setAuthInfo] = React.useState({
    id: null,
    userData: {},
  });

  const isAuthenticated = () => authInfo.id !== null;
  const receiveNotifications = () => authInfo.userData.receiveNotifications;
  const completeProfile = () => authInfo.userData.profileComplete;

  React.useEffect(() => {
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
