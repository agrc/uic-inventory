import { AuthProvider } from './AuthProvider';
import 'react-toastify/dist/ReactToastify.css';
import ApplicationRoutes from './Routes';

function App() {
  return (
    <AuthProvider>
      <ApplicationRoutes />
    </AuthProvider>
  );
}

export default App;
