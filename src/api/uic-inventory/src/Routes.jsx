import { Navigation, Navigate, Route, Router, Routes, ToastContainer } from './components/PageElements';
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
      <Route path="/site/create" element={<Sites.CreateOrEditSite />} />
      <Route path="/site/:siteId/add-details" element={<Sites.CreateOrEditSite />} />
      <Route path="/site/:siteId/add-contacts" element={<Sites.AddSiteContacts />} />
      <Route path="/site/:siteId/add-location" element={<Sites.AddSiteLocation />} />
      <Route path="/site/:siteId/inventory/create" element={<Wells.CreateOrEditInventory />} />
      <Route path="/site/:siteId/inventory/:inventoryId/details" element={<Wells.CreateOrEditInventory />} />
      <Route path="/site/:siteId/inventory/:inventoryId/regulatory-contact" element={<Wells.AddSerWellContact />} />
      <Route path="/site/:siteId/inventory/:inventoryId/add-wells" element={<Wells.AddWells />} />
      <Route path="/site/:siteId/inventory/:inventoryId/add-well-details" element={<Wells.AddWellDetails />} />
      <Route path="/site/:siteId/inventory/:inventoryId/submit" element={<Wells.SubmitInventory />} />
      <Route
        exact
        strict
        path="/site/:siteId/inventory/:inventoryId"
        render={() => <Navigate to="/site/:siteId/inventory/:inventoryId/details" />}
      />
      <Route exact strict path="/site/:siteId" element={<Navigate to="/site/:siteId/add-details" />} />
      <Route exact strict path="/site/:siteId/inventory" element={<Navigate to="/" />} />
      <Route exact strict path="/site" element={<Navigate to="/" />} />
      <Route exact strict path="/signin-oidc" element={<Navigate to="/" />} />
      <Route exact path="/" element={<SitesAndInventory completeProfile={completeProfile} />} />
      <Route element={<NotFound />} />
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
