import { Navigation, Navigate, Route, Router, Routes, ToastContainer } from './components/PageElements';
import { Outlet } from 'react-router-dom';
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

function ApplicationRoutes() {
  const { isAuthenticated, isElevated, completeProfile } = useContext(AuthContext);

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
      {elevated && <Route path="/admin/accounts" element={<UserManagement />} />}
      <Route path="/contact" element={<ContactProgram />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/account/:id/profile" element={<Profile />} />
      <Route path="/site" element={<Outlet />}>
        <Route path="" element={<Navigate to="/" />}></Route>
        <Route path="create" element={<Sites.CreateOrEditSite />} />
        <Route path=":siteId" element={<Outlet />}>
          <Route path="" element={<Sites.CreateOrEditSite />} />
          <Route path="add-details" element={<Sites.CreateOrEditSite />} />
          <Route path="add-contacts" element={<Sites.AddSiteContacts />} />
          <Route path="add-location" element={<Sites.AddSiteLocation />} />
          <Route path="inventory" element={<Outlet />}>
            <Route path="" element={<Navigate to="/" />}></Route>
            <Route path="create" element={<Wells.CreateOrEditInventory />} />
            <Route path=":inventoryId" element={<Outlet />}>
              <Route path="" element={<Navigate to="/" />}></Route>
              <Route path="details" element={<Wells.CreateOrEditInventory />} />
              <Route path="regulatory-contact" element={<Wells.AddSerWellContact />} />
              <Route path="add-wells" element={<Wells.AddWells />} />
              <Route path="add-well-details" element={<Wells.AddWellDetails />} />
              <Route path="submit" element={<Wells.SubmitInventory />} />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route exact strict path="/signin-oidc" element={<Navigate to="/" />} />
      <Route exact path="/" element={<SitesAndInventory completeProfile={completeProfile} />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function UnauthenticatedRoutes() {
  return (
    <Routes>
      <Route path="/" element={<GenericLandingPage />} />
    </Routes>
  );
}

export default ApplicationRoutes;
