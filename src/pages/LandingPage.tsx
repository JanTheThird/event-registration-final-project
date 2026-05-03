import { useNavigate } from 'react-router-dom';
import { AdminPage } from './admin/AdminPage';
import { StudentPage } from './student/StudentPage';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div>
      <button onClick={() => navigate('/admin')}>Admin</button>    
      <button onClick={() => navigate('/student')}>Student</button> 
    </div>
  );
}

export default LandingPage;