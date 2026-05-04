import type { User } from '../../../utils/types/Index';

export default function UserTable({
  title,
  users,
  onToggle,
  onDelete,
  showDelete = false
}: {
  title: string;
  users: User[];
  onToggle: (id: number) => void;
  onDelete?: (id: number) => void;
  showDelete?: boolean;
}) {
  return (
    <>
      <h2>{title} ({users.length})</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
            {showDelete && <th>Last Updated</th>}
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.email}</td>
              <td>{user.role.toUpperCase()}</td>
              <td>{user.status.toUpperCase()}</td>
              <td>
                <button onClick={() => onToggle(user.id)}>
                  {user.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                {showDelete && onDelete && (
                  <button onClick={() => onDelete(user.id)}>
                    Delete
                  </button>
                )}
              </td>
              {showDelete && <td>{user.lastUpdated}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}