import { useForm } from 'react-hook-form';

interface AddUserFormValues {
  email: string;
  role: 'student' | 'admin';
}

export default function AddUserForm({ onAdd }: {
  onAdd: (email: string, role: 'student' | 'admin') => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddUserFormValues>({
    defaultValues: {
      email: '',
      role: 'student',
    },
  });

  const onSubmit = (data: AddUserFormValues) => {
    onAdd(data.email, data.role);
    reset({ email: '', role: data.role });
  };

  return (
    <section>
      <h2>Add New User</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="email"
          placeholder="User Email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Enter a valid email address',
            },
          })}
        />
        {errors.email && <p className="error-message">{errors.email.message}</p>}
        <select
          {...register('role')}
        >
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">Create User</button>
      </form>
    </section>
  );
}