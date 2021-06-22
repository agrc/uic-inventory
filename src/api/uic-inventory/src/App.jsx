import { client, ClientContext } from './components/GraphQL';
import { AuthProvider } from './AuthProvider';
import 'react-toastify/dist/ReactToastify.css';
import Routes from './Routes';

function App() {
  return (
    <ClientContext.Provider value={client}>
      <AuthProvider>
        <Routes />
      </AuthProvider>
    </ClientContext.Provider>
  );
}

export default App;
