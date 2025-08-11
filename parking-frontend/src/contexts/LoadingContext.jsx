import { createContext, useState, useContext, Suspense, lazy } from 'react';
import LoadingSpinner from './components/common/LoadingSpinner';

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export const useLoading = () => useContext(LoadingContext);

// Lazy load components
const UserDashboard = lazy(() => import('./components/dashboard/user/UserDashboard'));
const ClientDashboard = lazy(() => import('./components/dashboard/client/ClientDashboard'));

// Wrap routes in Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    {/* ...existing routes... */}
  </Routes>
</Suspense>