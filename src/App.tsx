import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import { AdminPage } from './pages/admin/AdminPage';
import { StudentPage } from './pages/student/StudentPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/student" element={<StudentPage />} />
      </Routes>
    </Router>
  );
}

export default App;
