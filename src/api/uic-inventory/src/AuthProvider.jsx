import { useQuery } from 'graphql-hooks';

const ME_QUERY = `query {
  me {
    id
    firstName
    lastName
    access
  }
}`;

export const AuthContext = React.createContext();
const Provider = AuthContext.Provider;

export function AuthProvider({ children }) {
  const { loading, error, data } = useQuery(ME_QUERY);
  const [authInfo, setAuthInfo] = React.useState({
    id: null,
    userData: {},
  });

  const isAuthenticated = () => authInfo.id !== null;

  React.useEffect(() => {
    if (loading || error) {
      return;
    }

    setAuthInfo({
      id: data.me.id,
      userData: { ...data.me },
    });
  }, [loading, error, data]);

  return <Provider value={{ error, authInfo, isAuthenticated, setAuthInfo }}>{children}</Provider>;
}
