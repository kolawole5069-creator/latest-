import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import Layout from './components/Layout';
import LoadingScreen from './components/LoadingScreen';

const Landing = lazy(() => import('./pages/Landing'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Schools = lazy(() => import('./pages/Schools'));
const Students = lazy(() => import('./pages/Students'));
const Results = lazy(() => import('./pages/Results'));
const ReportCard = lazy(() => import('./pages/ReportCard'));
const Settings = lazy(() => import('./pages/Settings'));

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { user, profile, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" />;
  if (roles && profile && !roles.includes(profile.role)) return <Navigate to="/" />;

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" /></div>}>
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/schools" element={<ProtectedRoute roles={['super_admin']}><Schools /></ProtectedRoute>} />
                        <Route path="/students" element={<ProtectedRoute roles={['super_admin', 'school_admin']}><Students /></ProtectedRoute>} />
                        <Route path="/results" element={<ProtectedRoute roles={['super_admin', 'school_admin', 'teacher']}><Results /></ProtectedRoute>} />
                        <Route path="/report-card/:studentId" element={<ReportCard />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                      </Routes>
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}
