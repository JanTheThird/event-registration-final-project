import { useNavigate } from 'react-router-dom';
import { useDB } from '../utils/localdb/db';
import { useAuth } from '../utils/context/AuthContext';
import { useForm } from 'react-hook-form';

interface LoginFormValues {
  email: string;
  password: string;
}

function LandingPage() {
  const navigate = useNavigate();
  const db = useDB();
  const { login, userId, user, logout } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>();

  const onSubmit = (data: LoginFormValues) => {
    const user = db.authenticateUser(data.email, data.password);
    if (!user) {
      alert('Invalid credentials or inactive account.');
      return;
    }
    login(user.id);
    if (user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/student');
    }
  };

  const goToDashboard = () => {
    if (!user) return;
    navigate(user.role === 'admin' ? '/admin' : '/student');
  };

  return (
    <div className="landing-container">
      <div className="landing-card">
        <h1 className="landing-title">Welcome to Event Manager</h1>
        {userId && user ? (
          <div className="login-form">
            <p style={{ marginBottom: '1rem', color: '#595959' }}>
              Signed in as <strong>{user.email}</strong> ({user.role})
            </p>
            <button type="button" className="btn-primary" onClick={goToDashboard}>
              Continue to dashboard
            </button>
            <button
              type="button"
              className="btn-logout"
              onClick={() => logout()}
              style={{ marginTop: '12px', width: '100%', justifyContent: 'center' }}
            >
              Log out
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="login-form">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <span className="error-message">{errors.email.message}</span>}

            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && <span className="error-message">{errors.password.message}</span>}

            <button type="submit" className="btn-primary" style={{ marginTop: '8px', width: '100%', justifyContent: 'center' }}>
              Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default LandingPage;