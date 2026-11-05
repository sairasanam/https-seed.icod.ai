import { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProfile, logout } from '@/store/slices/authSlice';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNavigation from '@/components/BottomNavigation';
import SplashScreen from '@/components/SplashScreen';
import { Spinner } from '@/components/ui';

// Lazy-loaded pages — each in its own chunk for optimal code splitting
const Auth = lazy(() => import('@/pages/Auth'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const InnerCircle = lazy(() => import('@/pages/InnerCircle'));
const Community = lazy(() => import('@/pages/Community'));
const OuterCircle = lazy(() => import('@/pages/OuterCircle'));
const Explore = lazy(() => import('@/pages/Explore'));
const Profile = lazy(() => import('@/pages/Profile'));
const PersonDetail = lazy(() => import('@/pages/PersonDetail'));
const InitiativeDetail = lazy(() => import('@/pages/InitiativeDetail'));
const OrganizationDetail = lazy(() => import('@/pages/OrganizationDetail'));
const Journal = lazy(() => import('@/pages/Journal'));
const Reminders = lazy(() => import('@/pages/Reminders'));
const Admin = lazy(() => import('@/pages/Admin'));

/** Lightweight fallback shown while a lazy chunk loads */
function RouteLoader() {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center"
      data-icod-id="src_app_tsx_ab5f">
      <Spinner size="lg" data-icod-id="src_app_tsx_04ad" />
    </div>
  );
}

export default function App() {
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((state) => state.auth);
  const [showSplash, setShowSplash] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Clear auth on every page load - app always starts fresh at login
  useEffect(() => {
    // Clear persisted token and reset auth state on mount
    localStorage.removeItem('token');
    dispatch(logout());
    setInitialized(true);
  }, [dispatch]);

  // Fetch profile on app load if token exists (only after initialization)
  useEffect(() => {
    if (initialized && token && !user) {
      dispatch(fetchProfile());
    }
  }, [dispatch, token, user, initialized]);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  // Only show splash when there's an active session being validated
  // Since we clear token on mount, splash is skipped by default
  const shouldShowSplash = showSplash && !!token;
  const isReady = !!user || (!token);

  return (
    <BrowserRouter>
      {/* Splash screen overlay - only shows when there's an active session */}
      {shouldShowSplash && <SplashScreen onComplete={handleSplashComplete} ready={isReady} data-icod-id="src_app_tsx_cbf6" />}
      <div
        className="min-h-screen bg-background text-foreground"
        data-icod-id="src_app_tsx_14c0">
        <Suspense fallback={<RouteLoader data-icod-id="src_app_tsx_1b03" />}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Auth data-icod-id="src_app_tsx_aa1c" />} />
            <Route path="/register" element={<Auth data-icod-id="src_app_tsx_6278" />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute data-icod-id="src_app_tsx_0108" />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard data-icod-id="src_app_tsx_985c" />} />
              <Route path="/inner-circle" element={<InnerCircle data-icod-id="src_app_tsx_2aec" />} />
              <Route path="/person/:id" element={<PersonDetail data-icod-id="src_app_tsx_f875" />} />
              <Route path="/community" element={<Community data-icod-id="src_app_tsx_a7a2" />} />
              <Route path="/initiative/:id" element={<InitiativeDetail data-icod-id="src_app_tsx_bcbf" />} />
              <Route path="/outer-circle" element={<OuterCircle data-icod-id="src_app_tsx_125a" />} />
              <Route path="/organization/:id" element={<OrganizationDetail data-icod-id="src_app_tsx_6e5d" />} />
              <Route path="/explore" element={<Explore data-icod-id="src_app_tsx_549f" />} />
              <Route path="/profile" element={<Profile data-icod-id="src_app_tsx_3826" />} />
              <Route path="/journal" element={<Journal data-icod-id="src_app_tsx_1660" />} />
              <Route path="/reminders" element={<Reminders data-icod-id="src_app_tsx_df33" />} />
              <Route path="/admin" element={<Admin data-icod-id="src_app_tsx_5317" />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>

        <BottomNavigation data-icod-id="src_app_tsx_4e14" />
      </div>
    </BrowserRouter>
  );
}
