import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TranslationProvider } from './context/TranslationContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { Dashboard } from './pages/Dashboard';
import { Dependents } from './pages/Dependents';
import { Health } from './pages/Health/Health';
import { AdminDashboard } from './pages/Admin/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <TranslationProvider>
        <Router>
          <div className="min-h-screen bg-gray-100">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/dependents" element={<Dependents />} />
              <Route path="/health" element={<Health />} />
              <Route path="/dependents/:id/health" element={<Health />} />
            </Route>

            <Route element={<ProtectedRoute adminOnly={true} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Routes>
          </div>
        </Router>
      </TranslationProvider>
    </AuthProvider>
  );
}

export default App;
