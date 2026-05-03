import { useNavigate } from 'react-router-dom';
import { AdminPage } from '../pages/admin/AdminPage';
import { StudentPage } from './student/StudentPage';

function LoginPage() {
  const navigate = useNavigate();

  return (
    <div>
      <button onClick={() => navigate('/admin')}>Admin</button>    
      <button onClick={() => navigate('/student')}>Student</button> 
    </div>
  );
}

export default LoginPage;