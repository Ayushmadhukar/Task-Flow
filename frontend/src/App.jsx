import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/admin/Dashboard';
import Projects from './pages/admin/Projects';
import Tasks from './pages/admin/Tasks';
import MemberDashboard from './pages/member/Dashboard';


const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/member/dashboard'} replace />;
};


const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/member/dashboard'} replace />;
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
      
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />

          
          <Route
            path="/admin/dashboard"
            element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>}
          />
          <Route
            path="/admin/projects"
            element={<ProtectedRoute role="admin"><Projects /></ProtectedRoute>}
          />
          <Route
            path="/admin/tasks"
            element={<ProtectedRoute role="admin"><Tasks /></ProtectedRoute>}
          />

        
          <Route
            path="/member/dashboard"
            element={<ProtectedRoute role="member"><MemberDashboard /></ProtectedRoute>}
          />

         
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
