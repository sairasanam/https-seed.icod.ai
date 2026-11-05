import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { Spinner } from '@/components/ui';

export default function ProtectedRoute() {
  const { token, status } = useAppSelector((state) => state.auth);

  if (status === 'loading') {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-background"
        data-icod-id="src_components_protectedroute_tsx_73d3">
        <Spinner size="lg" data-icod-id="src_components_protectedroute_tsx_9211" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
