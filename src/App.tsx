import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './utils/context/AuthContext';
import { useDB } from './utils/localdb/db';
import LandingPage from './pages/LandingPage';
import AdminPage from './pages/admin/AdminPage';
import StudentPage from './pages/student/StudentPage';
import NotificationLogPage from './pages/student/NotificationLogPage';
import type { ReactNode } from 'react';

// ✅ Protected Route Component (Reusable!)
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { userId, isLoading } = useAuth();
  const db = useDB();
  if (isLoading) return <div className="page-container">Checking session...</div>;
  if (!userId) return <Navigate to="/" replace />;
  const user = db.findUser(userId);
  if (!user || user.status !== 'active') return <Navigate to="/" replace />;
  return userId ? <>{children}</> : <Navigate to="/" replace />;
}

// ✅ Role-based Route Guard
function RoleProtectedRoute({ 
  children, 
  allowedRole 
}: { 
  children: ReactNode; 
  allowedRole: 'student' | 'admin' 
}) {
  const { userId } = useAuth();
  const db = useDB();
  
  if (!userId) return <Navigate to="/" replace />;
  
  const user = db.findUser(userId);
  if (user?.role !== allowedRole) {
    return <Navigate to={allowedRole === 'admin' ? '/student' : '/admin'} replace />;
  }
  
  return <>{children}</>;
}

function AppContent() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRole="admin">
                <AdminPage />
              </RoleProtectedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/*" 
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRole="student">
                <StudentPage />
              </RoleProtectedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/notifications" 
          element={
            <ProtectedRoute>
              <NotificationLogPage />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;