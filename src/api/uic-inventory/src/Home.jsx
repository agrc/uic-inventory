import { List } from 'react-content-loader';
import { AuthContext } from './AuthProvider';
import { Link } from 'react-router-dom';
import Chrome from './components/PageElements/Chrome';
import Header from './Header';

export function Home() {
  const { isAuthenticated, completeProfile } = React.useContext(AuthContext);

  return isAuthenticated() ? <SitesAndInventory completeProfile={completeProfile} /> : <GenericLandingPage />;
}

function SitesAndInventory({ completeProfile }) {
  return (
    <main>
      <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <Header>
          {completeProfile() ? (
            <div className="flex justify-end">
              <SiteCreationButton className="m-0" access={!completeProfile()} />
            </div>
          ) : (
            <p>
              You must complete your{' '}
              <Link type="primary" to="/profile">
                profile
              </Link>{' '}
              before submitting sites.
            </p>
          )}
        </Header>
        <Chrome title="Your sites and inventory">
          <div className="self-center w-full text-center">
            {completeProfile() ? (
              <List animate={false} />
            ) : (
              <p>
                You must complete your{' '}
                <Link type="primary" to="/profile">
                  profile
                </Link>{' '}
                before submitting sites.
              </p>
            )}
            <SiteCreationButton access={!completeProfile()} />
          </div>
        </Chrome>
      </div>
    </main>
  );
}

function GenericLandingPage() {
  return (
    <main>
      <Chrome title="About the program">
        <List animate={false} />
      </Chrome>
    </main>
  );
}

function SiteCreationButton({ access, className = 'm-4 text-2xl' }) {
  return (
    <Link to="/site/create" type="button" disabled={access} className={className}>
      Add site
    </Link>
  );
}

export default Home;
