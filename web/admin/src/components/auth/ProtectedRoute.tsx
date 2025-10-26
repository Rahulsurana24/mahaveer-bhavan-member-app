import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Loading } from '@/components/ui/loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute = ({ 
  children, 
  requireAuth = true,
  requireAdmin = false,
  requireSuperAdmin = false,
  redirectTo = '/auth'
}: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, role, loading: profileLoading } = useUserProfile();
  const location = useLocation();

  const loading = authLoading || profileLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading..." />
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuth && !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check if password change is required
  if (profile?.needs_password_change && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  // Check admin requirement
  const adminRoles = ['admin', 'superadmin', 'super_admin', 'management_admin', 'partial_admin', 'view_only_admin', 'trustee'];
  if (requireAdmin && (!role || !adminRoles.includes(role.name))) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check super admin requirement
  const superAdminRoles = ['superadmin', 'super_admin'];
  if (requireSuperAdmin && (!role || !superAdminRoles.includes(role.name))) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};