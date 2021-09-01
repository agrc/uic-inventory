import { Navigation, Route, Router, Switch, ToastContainer } from './components/PageElements';
import { ContactProgram, Profile, Sites, GenericLandingPage, SitesAndInventory, Wells } from './components/Pages';
import { AuthContext } from './AuthProvider';
import { useContext } from 'react';

function Routes() {
  const { isAuthenticated, completeProfile } = useContext(AuthContext);

  return (
    <Router>
      <Navigation />
      <Switch>
        {isAuthenticated() ? <AuthenticatedRoutes completeProfile={completeProfile} /> : <UnauthenticatedRoutes />}
      </Switch>
      <ToastContainer theme="dark" />
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
        <Sites.CreateOrEditSite />
      </Route>
      <Route path="/site/:siteId/add-details">
        <Sites.CreateOrEditSite />
      </Route>
      <Route path="/site/:siteId/add-contacts">
        <Sites.AddSiteContacts />
      </Route>
      <Route path="/site/:siteId/add-location">
        <Sites.AddSiteLocation />
      </Route>
      <Route path="/site/:siteId/well/create">
        <Wells.CreateOrEditWell />
      </Route>
      <Route path="/site/:siteId/well/:wellId/add-details">
        <Wells.CreateOrEditWell />
      </Route>
      <Route path="/site/:siteId/well/:wellId/add-location">
        <Wells.AddWellLocation />
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
