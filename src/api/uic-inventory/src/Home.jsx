import { List } from 'react-content-loader';
import { AuthContext } from './AuthProvider';

export function Home() {
  const { isAuthenticated } = React.useContext(AuthContext);

  return isAuthenticated() ? <SitesAndInventory /> : <GenericLandingPage />;
}

function SitesAndInventory() {
  return (
    <main>
      <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="h-full p-4 border-4 border-gray-200 border-dashed rounded-lg">
            <h1 className="mb-3 text-2xl font-medium">Your sites and inventory</h1>
            <List animate={false} />
          </div>
        </div>
      </div>
    </main>
  );
}

function GenericLandingPage() {
  return (
    <main>
      <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="h-full p-4 border-4 border-gray-200 border-dashed rounded-lg">
            <h1 className="mb-3 text-2xl font-medium">About the program</h1>
            <List animate={false} />
          </div>
        </div>
      </div>
    </main>
  );
}

export default Home;
