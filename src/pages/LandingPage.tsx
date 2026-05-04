import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDB } from '../utils/localdb/db';

function LandingPage() {
  const navigate = useNavigate();
  const db = useDB();
  const allUsers = db.getAllUsers(); // Get Ana, Jack, etc. from your JSON/LocalStorage

  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = allUsers.find(u => u.id === parseInt(selectedUserId));
    
    if (!user) {
      alert("Please select a user first!");
      return;
    }

    // Save the "Current User" so the app knows who is browsing
    localStorage.setItem('current_user_id', user.id.toString());

    if (user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/student');
    }
  };

  return (
    <div className="landing-container">
      <h1>Welcome to Event Manager</h1>
      <form onSubmit={handleLogin} className="login-form">
        <label>Identify Yourself:</label>
        <select 
          value={selectedUserId} 
          onChange={(e) => setSelectedUserId(e.target.value)}
        >
          <option value="">-- Choose User --</option>
          {allUsers.map(user => (
            <option key={user.id} value={user.id}>
              {user.email} ({user.role})
            </option>
          ))}
        </select>
        <button type="submit" disabled={!selectedUserId}>Login</button>
      </form>
    </div>
  );
}

export default LandingPage;