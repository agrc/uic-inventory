import { AuthProvider } from './AuthProvider';
import ApplicationRoutes from './Routes';

function App() {
  return (
    <AuthProvider>
      <ApplicationRoutes />
    </AuthProvider>
  );
}

export default App;
