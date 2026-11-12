import { Route } from "react-router-dom";
import ProtectedRoute from '../components/protected/ProtectedRoute';
import LayoutWrapper from '../components/layout/LayoutWrapper';

/**
 * Renders protected routes with role-based access control and optional layout wrapper
 * @param {Array} routeConfig - Array of route configuration objects with role and routes
 * @returns {Array} Array of Route components
 */
export const renderProtectedRoutes = (routeConfig) => {
  if (!Array.isArray(routeConfig)) {
    console.error('Invalid route configuration provided');
    return [];
  }

  return routeConfig
    .flatMap(({ role, routes, description = '' }) => {
      if (!role || !Array.isArray(routes)) {
        console.warn('Invalid route group found:', { role, routes });
        return null;
      }

      return routes.map(route => {
        if (!route?.path || !route?.element) {
          console.warn('Invalid route definition:', route);
          return null;
        }

        const isCommonRoute = role === 'common';
        const routeElement = isCommonRoute ? route.element : (
          <LayoutWrapper 
            role={role}
            aria-label={`${role} layout section`}
          >
            <main role="main" aria-label={description || `${role} content area`}>
              {route.element}
            </main>
          </LayoutWrapper>
        );

        return (
          <Route
            key={route.path}
            element={
              <ProtectedRoute 
                allowedRoles={isCommonRoute ? [] : [role]}
                aria-label={`Protected ${role} route`}
              />
            }
          >
            <Route
              path={route.path}
              element={routeElement}
            />
          </Route>
        );
      });
    })
    .filter(Boolean);
};

/**
 * Renders simple protected routes with role-based access control
 * @param {Array} routes - Array of route objects with path, element and role
 * @returns {Array} Array of Route components
 */
export const renderSimpleProtectedRoutes = (routes) => {
  if (!Array.isArray(routes)) {
    console.error('Invalid routes array provided');
    return [];
  }

  return routes
    .map(route => {
      if (!route?.path || !route?.element || !route?.role) {
        console.warn('Invalid route definition:', route);
        return null;
      }

      return (
        <Route
          key={route.path}
          element={
            <ProtectedRoute 
              allowedRoles={[route.role]}
              aria-label={`Protected ${route.role} route`}
            />
          }
        >
          <Route 
            path={route.path}
            element={
              <main role="main" aria-label={`${route.role} content area`}>
                {route.element}
              </main>
            }
          />
        </Route>
      );
    })
    .filter(Boolean);
};