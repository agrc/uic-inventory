import { Navigation, Redirect, Route, Router, Switch, ToastContainer } from './components/PageElements';
import {
  ContactProgram,
  NotFound,
  Profile,
  Sites,
  GenericLandingPage,
  Review,
  SitesAndInventory,
  UserManagement,
  Wells,
} from './components/Pages';
import { AuthContext } from './AuthProvider';
import { useContext } from 'react';

function Routes() {
  const { isAuthenticated, isElevated, completeProfile } = useContext(AuthContext);

  return (
    <Router>
      <Navigation />
      <Switch>
        {isAuthenticated() ? (
          <AuthenticatedRoutes elevated={isElevated()} completeProfile={completeProfile} />
        ) : (
          <UnauthenticatedRoutes />
        )}
      </Switch>
      <ToastContainer theme="dark" />
    </Router>
  );
}

function AuthenticatedRoutes({ completeProfile, elevated }) {
  return (
    <Switch>
      {elevated && (
        <Route path="/review/site/:siteId/inventory/:inventoryId">
          <Review />
        </Route>
      )}
      {elevated && (
        <Route path="/admin/accounts">
          <UserManagement />
        </Route>
      )}
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
      <Route path="/site/:siteId/inventory/create">
        <Wells.CreateOrEditInventory />
      </Route>
      <Route path="/site/:siteId/inventory/:inventoryId/details">
        <Wells.CreateOrEditInventory />
      </Route>
      <Route path="/site/:siteId/inventory/:inventoryId/regulatory-contact">
        <Wells.AddSerWellContact />
      </Route>
      <Route path="/site/:siteId/inventory/:inventoryId/add-wells">
        <Wells.AddWells />
      </Route>
      <Route path="/site/:siteId/inventory/:inventoryId/add-well-details">
        <Wells.AddWellDetails />
      </Route>
      <Route path="/site/:siteId/inventory/:inventoryId/submit">
        <Wells.SubmitInventory />
      </Route>
      <Redirect
        exact
        strict
        from="/site/:siteId/inventory/:inventoryId"
        to="/site/:siteId/inventory/:inventoryId/details"
      />
      <Redirect exact strict from="/site/:siteId" to="/site/:siteId/add-details" />
      <Redirect exact strict from="/site/:siteId/inventory" to="/" />
      <Redirect exact strict from="/site" to="/" />
      <Route exact path="/">
        <SitesAndInventory completeProfile={completeProfile} />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
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
