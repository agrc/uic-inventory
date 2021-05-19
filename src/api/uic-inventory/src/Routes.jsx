import { Navigation, Route, Router, Switch, ToastContainer } from './components/PageElements';
import { CreateSite, ContactProgram, Profile, Sites, GenericLandingPage, SitesAndInventory } from './components/Pages';
import { AuthContext } from './AuthProvider';

const contextClass = {
  success: 'bg-green-400',
  error: 'bg-red-600',
  info: 'bg-gray-600',
  warning: 'bg-orange-400',
  default: 'bg-indigo-600',
  dark: 'bg-white-600 font-gray-300',
};

function Routes() {
  const { isAuthenticated, completeProfile } = React.useContext(AuthContext);

  return (
    <Router>
      <Navigation />
      <Switch>
        {isAuthenticated() ? <AuthenticatedRoutes completeProfile={completeProfile} /> : <UnauthenticatedRoutes />}
      </Switch>
      <ToastContainer
        toastClassName={({ type }) =>
          contextClass[type || 'default'] +
          ' my-3 relative flex p-1 min-h-10 rounded-md justify-between overflow-hidden cursor-pointer'
        }
        bodyClassName={() => 'text-sm font-white font-med block p-3'}
      />
    </Router>
  );
}

function AuthenticatedRoutes({ completeProfile }) {
  return (
    <>
      <Route path="/contact">
        <ContactProgram />
      </Route>
      <Route path="/profile">
        <Profile />
      </Route>
      <Route path="/account/:id/profile">
        <Profile />
      </Route>
      <Route path="/site/create">
        <CreateSite />
      </Route>
      <Route path="/site/:siteId/add-contacts">
        <Sites.AddSiteContacts />
      </Route>
      <Route path="/site/:siteId/add-location">
        <Sites.AddSiteLocation />
      </Route>
      <Route exact path="/">
        <SitesAndInventory completeProfile={completeProfile} />
      </Route>
    </>
  );
}

function UnauthenticatedRoutes() {
  return (
    <Route path="/">
      <GenericLandingPage />
    </Route>
  );
}

export default Routes;
