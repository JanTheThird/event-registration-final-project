import { useState } from 'react';

export default function AddUserForm({ onAdd }: {
  onAdd: (email: string, role: 'student' | 'admin') => void;
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'student' | 'admin'>('student');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return alert('Email required');

    onAdd(email, role);
    setEmail('');
  };

  return (
    <section>
      <h2>Add New User</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="User Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
        >
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">Create User</button>
      </form>
    </section>
  );
}