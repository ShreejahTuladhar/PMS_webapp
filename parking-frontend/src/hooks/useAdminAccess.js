import { useMemo } from 'react';
import { useAuth } from './useAuth';

/**
 * Hook to check admin access levels
 */
export function useAdminAccess() {
  const { user, isAuthenticated } = useAuth();

  const adminAccess = useMemo(() => {
    if (!isAuthenticated || !user) {
      return {
        isSuperAdmin: false,
        isAdmin: false,
        canViewTraffic: false,
        canViewInternalNav: false,
        hasAdminPanel: false
      };
    }

    const isSuperAdmin = user.role === 'super_admin';
    const isAdmin = isSuperAdmin || user.role === 'admin';

    // Verify super admin session security
    const isSuperAdminVerified = isSuperAdmin && (() => {
      try {
        const metadata = sessionStorage.getItem('_ss_meta');
        if (!metadata) return false;
        
        const decoded = JSON.parse(atob(metadata));
        return decoded.role_verified === 'super_admin_verified' && 
               decoded.security_level === 'maximum' &&
               (Date.now() - decoded.timestamp) < 24 * 60 * 60 * 1000; // 24 hours
      } catch {
        return false;
      }
    })();

    return {
      isSuperAdmin: isSuperAdminVerified,
      isAdmin,
      canViewTraffic: isSuperAdminVerified,
      canViewInternalNav: isSuperAdminVerified,
      hasAdminPanel: isAdmin,
      user: user
    };
  }, [user, isAuthenticated]);

  return adminAccess;
}