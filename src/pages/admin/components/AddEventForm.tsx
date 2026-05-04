import { useState } from 'react';

export default function AddEventForm({ onAdd }: {
  onAdd: (data: any) => void;
}) {
  const [form, setForm] = useState({
    name: '',
    date: '',
    quota: 0,
    location: '',
    description: ''
  });

  return (
    <section>
      <h2>Add New Event</h2>
      <form onSubmit={(e) => {
        e.preventDefault();
        onAdd(form);
        setForm({ name: '', date: '', quota: 0, location: '', description: '' });
      }}>
        <input
          placeholder="Event Name"
          value={form.name}
          onChange={(e) => setForm({...form, name: e.target.value})}
        />
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({...form, date: e.target.value})}
        />
        <input
          type="number"
          value={form.quota}
          onChange={(e) => setForm({...form, quota: +e.target.value})}
        />
        <input
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({...form, location: e.target.value})}
        />
        <textarea
          value={form.description}
          onChange={(e) => setForm({...form, description: e.target.value})}
        />
        <button>Create Event</button>
      </form>
    </section>
  );
}