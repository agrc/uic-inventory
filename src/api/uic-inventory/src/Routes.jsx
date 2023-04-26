import { Navigation, Navigate, Route, Router, Routes, ToastContainer } from './components/PageElements';
import { Outlet } from 'react-router-dom';
import {
  AuthorizationByRule,
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

function ApplicationRoutes() {
  const { status, isAuthenticated, isElevated, completeProfile } = useContext(AuthContext);

  if (status === 'loading') {
    return (
      <div>
        <Navigation authenticationStatus={status} />
        <GenericLandingPage />
      </div>
    );
  }

  return (
    <Router>
      <Navigation />
      {isAuthenticated() ? (
        <AuthenticatedRoutes elevated={isElevated()} completeProfile={completeProfile} />
      ) : (
        <UnauthenticatedRoutes />
      )}
      <ToastContainer theme="dark" />
    </Router>
  );
}

function AuthenticatedRoutes({ completeProfile, elevated }) {
  return (
    <Routes>
      {elevated && <Route path="/review/site/:siteId/inventory/:inventoryId" element={<Review />} />}
      {elevated && (
        <Route path="/review/site/:siteId/inventory/:inventoryId/authorization" element={<AuthorizationByRule />} />
      )}
      {elevated && <Route path="/admin/accounts" element={<UserManagement />} />}
      <Route path="/contact" element={<ContactProgram />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/account/:id/profile" element={<Profile />} />
      <Route path="/site" element={<Outlet />}>
        <Route index element={<Navigate to="/" />}></Route>
        <Route path="create" element={<Sites.CreateOrEditSite />} />
        <Route path=":siteId" element={<Outlet />}>
          <Route index element={<Sites.CreateOrEditSite />} />
          <Route path="add-details" element={<Sites.CreateOrEditSite />} />
          <Route path="add-contacts" element={<Sites.AddSiteContacts />} />
          <Route path="add-location" element={<Sites.AddSiteLocation />} />
          <Route path="inventory" element={<Outlet />}>
            <Route index element={<Navigate to="/" />}></Route>
            <Route path="create" element={<Wells.CreateOrEditInventory />} />
            <Route path=":inventoryId" element={<Outlet />}>
              <Route index element={<Navigate to="/" />}></Route>
              <Route path="details" element={<Wells.CreateOrEditInventory />} />
              <Route path="regulatory-contact" element={<Wells.AddSerWellContact />} />
              <Route path="add-wells" element={<Wells.AddWells />} />
              <Route path="add-well-details" element={<Wells.AddWellDetails />} />
              <Route path="submit" element={<Wells.SubmitInventory />} />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route path="/signin-oidc" element={<Navigate to="/" />} />
      <Route path="/" element={<SitesAndInventory completeProfile={completeProfile} />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function UnauthenticatedRoutes() {
  return (
    <Routes>
      <Route path="/" element={<GenericLandingPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default ApplicationRoutes;
