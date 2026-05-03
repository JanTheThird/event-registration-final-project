import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AdminPage from './pages/admin/AdminPage';
import StudentPage from './pages/student/StudentPage';
import NotificationLogPage from './pages/student/NotificationLogPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/student" element={<StudentPage />} />
        <Route path="/notifications" element={<NotificationLogPage />} />
      </Routes>
    </Router>
  );
}

export default App;
