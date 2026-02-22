import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { fetchCurrentUser } from '../store/slices/authSlice';

interface PrivateRouteProps {
  children: React.ReactNode;
  requirePremium?: boolean;
}

/**
 * PrivateRoute wrapper component for protecting routes that require authentication
 * 
 * @param children - The component(s) to render if authenticated
 * @param requirePremium - If true, requires premium role in addition to authentication
 * 
 * Usage:
 * <PrivateRoute>
 *   <Dashboard />
 * </PrivateRoute>
 * 
 * <PrivateRoute requirePremium>
 *   <PremiumFeature />
 * </PrivateRoute>
 */
export const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  requirePremium = false 
}) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { user, token, loading } = useAppSelector((state) => state.auth);

  // Fetch user data if we have a token but no user
  useEffect(() => {
    if (token && !user && !loading) {
      dispatch(fetchCurrentUser());
    }
  }, [token, user, loading, dispatch]);

  // Show loading state while fetching user
  if (loading || (token && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check premium requirement
  if (requirePremium && user.role !== 'premium') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium Required</h2>
          <p className="text-gray-600 mb-6">
            This feature is only available to premium members. Upgrade your account to access advanced trading signals and alerts.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition font-medium"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Render protected content
  return <>{children}</>;
};
