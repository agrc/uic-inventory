import { useQueryClient } from '@tanstack/react-query';
import { Suspense, useContext } from 'react';
import { Outlet, Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router';
import { AuthContext } from './AuthContext';
import { Chrome, Navigate, Navigation, ToastContainer } from './components/PageElements';
import { RouterErrorPage } from './components/Pages/ErrorPages';
import { Component } from './components/Pages/LandingPage';
import {
  inventoryLoader,
  loggedInUserLoader,
  serContactLoader,
  siteContactLoader,
  siteLoader,
} from './components/Pages/loaders';

function ApplicationRoutes() {
  const { status, isAuthenticated, isElevated, completeProfile } = useContext(AuthContext);
  const queryClient = useQueryClient();

  if (status === 'pending') {
    return (
      <div>
        <Navigation authenticationStatus={status} />
        <Component />
      </div>
    );
  }

  const routes = isAuthenticated()
    ? AuthenticatedRoutes(isElevated(), completeProfile, queryClient)
    : UnauthenticatedRoutes();
  const router = createBrowserRouter(routes, {
    future: {
      // Normalize `useNavigation()`/`useFetcher()` `formMethod` to uppercase
      v7_normalizeFormMethod: true,
    },
  });

  return (
    <Suspense fallback={<div> loading...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

function AuthenticatedRoutes(elevated, completeProfile, queryClient) {
  return createRoutesFromElements(
    <Route
      element={
        <>
          <Navigation />
          <Outlet />
          <ToastContainer theme="dark" />
        </>
      }
      errorElement={
        <>
          <Navigation />
          <Chrome>
            <RouterErrorPage />
          </Chrome>
        </>
      }
    >
      {elevated && (
        <Route
          path="/review/site/:siteId/inventory/:inventoryId"
          lazy={() => import('./components/Pages/Admin/Review')}
        />
      )}
      {elevated && <Route path="/admin/accounts" lazy={() => import('./components/Pages/Admin/UserManagement')} />}
      <Route path="/contact" lazy={() => import('./components/Pages/ContactProgram')} />
      <Route
        path="/profile"
        lazy={() => import('./components/Pages/Profile')}
        loader={loggedInUserLoader(queryClient)}
      />
      <Route
        path="/account/:id/profile"
        loader={loggedInUserLoader(queryClient)}
        lazy={() => import('./components/Pages/Profile')}
      />
      <Route path="/site" element={<Outlet />}>
        <Route index element={<Navigate to="/" />}></Route>
        <Route path="create" lazy={() => import('./components/Pages/Sites/CreateOrEditSite')} />
        <Route path=":siteId" element={<Outlet />}>
          <Route index lazy={() => import('./components/Pages/Sites/CreateOrEditSite')} />
          <Route
            path="add-details"
            loader={siteLoader(queryClient)}
            lazy={() => import('./components/Pages/Sites/CreateOrEditSite')}
          />
          <Route
            path="add-contacts"
            loader={siteContactLoader(queryClient)}
            lazy={() => import('./components/Pages/Sites/AddSiteContacts')}
          />
          <Route
            path="add-location"
            loader={siteLoader(queryClient)}
            lazy={() => import('./components/Pages/Sites/AddSiteLocation')}
          />
          <Route path="inventory" element={<Outlet />}>
            <Route index element={<Navigate to="/" />}></Route>
            <Route
              path="create"
              loader={inventoryLoader(queryClient)}
              lazy={() => import('./components/Pages/Wells/CreateOrEditInventory')}
            />
            <Route path=":inventoryId" element={<Outlet />}>
              <Route index element={<Navigate to="/" />}></Route>
              <Route
                path="details"
                loader={inventoryLoader(queryClient)}
                lazy={() => import('./components/Pages/Wells/CreateOrEditInventory')}
              />
              <Route
                path="regulatory-contact"
                loader={serContactLoader(queryClient)}
                lazy={() => import('./components/Pages/Wells/AddSerWellContact')}
              />
              <Route
                path="add-wells"
                loader={inventoryLoader(queryClient)}
                lazy={() => import('./components/Pages/Wells/AddWells')}
              />
              <Route
                path="add-well-details"
                loader={inventoryLoader(queryClient)}
                lazy={() => import('./components/Pages/Wells/AddWellDetails')}
              />
              <Route
                path="submit"
                loader={inventoryLoader(queryClient)}
                lazy={() => import('./components/Pages/Wells/SubmitInventory')}
              />
            </Route>
          </Route>
        </Route>
      </Route>
      <Route path="/signin-oidc" element={<Navigate to="/" />} />
      <Route
        path="/"
        lazy={async () => {
          let { Component } = await import('./components/Pages/Home');
          return { element: <Component completeProfile={completeProfile} /> };
        }}
      />
      <Route path="*" lazy={() => import('./components/Pages/NotFound')} />
    </Route>,
  );
}

function UnauthenticatedRoutes() {
  return createRoutesFromElements(
    <Route
      element={
        <>
          <Navigation />
          <Outlet />
          <ToastContainer theme="dark" />
        </>
      }
    >
      <Route path="/" lazy={() => import('./components/Pages/LandingPage')} />
      <Route path="*" element={<Navigate to="/" />} />
    </Route>,
  );
}

export default ApplicationRoutes;
