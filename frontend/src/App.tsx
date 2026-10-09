import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { EncryptionProvider } from './context/EncryptionContext';
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
import { CostApprovals } from './pages/Settlement/CostApprovals';
import { Schedule } from './pages/Schedule/Schedule';
import { DependentDocuments } from './pages/Documents/DependentDocuments';
import {
  AssistantDashboard,
  EmployeeList,
  EmployeeForm,
  EmployeeDetail,
  WorkingHoursForm
} from './pages/Assistants';

function App() {
  return (
    <AuthProvider>
      <TranslationProvider>
        <EncryptionProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
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
                  <Route path="/dependents/:id/documents" element={<DependentDocuments />} />
                  <Route path="/cost-approvals" element={<CostApprovals />} />
                  <Route path="/schedule" element={<Schedule />} />

                  {/* Assistants Module */}
                  <Route path="/assistants/dashboard" element={<AssistantDashboard />} />
                  <Route path="/assistants" element={<EmployeeList />} />
                  <Route path="/assistants/new" element={<EmployeeForm />} />
                  <Route path="/assistants/:id" element={<EmployeeDetail />} />
                  <Route path="/assistants/:id/hours" element={<WorkingHoursForm />} />
                </Route>

              <Route element={<ProtectedRoute adminOnly={true} />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
              </Routes>
            </div>
          </Router>
        </EncryptionProvider>
      </TranslationProvider>
    </AuthProvider>
  );
}

export default App;
