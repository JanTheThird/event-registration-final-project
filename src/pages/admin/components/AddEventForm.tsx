import { useState, useEffect } from 'react';
import type { Event } from '../../../utils/types/Index';

interface EventFormData {
  id?: number;
  name: string;
  date: string;
  quota: number;
  location: string;
  description: string;
}

interface AddEventFormProps {
  onAdd: (data: EventFormData) => void;
  editingEvent?: Event | null;
  onUpdate?: (data: EventFormData) => void;
  onCancel?: () => void;
}

export default function AddEventForm({ 
  onAdd, 
  editingEvent, 
  onUpdate, 
  onCancel 
}: AddEventFormProps) {
  const [form, setForm] = useState<EventFormData>({
    name: '',
    date: '',
    quota: 0,
    location: '',
    description: ''
  });

  // Populate form when editing
  useEffect(() => {
    if (editingEvent) {
      setForm({
        id: editingEvent.id,
        name: editingEvent.name,
        date: editingEvent.date,
        quota: editingEvent.quota,
        location: editingEvent.location || '',
        description: editingEvent.description || ''
      });
    } else {
      setForm({ 
        id: undefined,
        name: '', 
        date: '', 
        quota: 0, 
        location: '', 
        description: '' 
      });
    }
  }, [editingEvent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingEvent && onUpdate) {
      onUpdate(form);
    } else {
      onAdd(form);
    }
  };

  const handleCancel = () => {
    setForm({ 
      id: undefined,
      name: '', 
      date: '', 
      quota: 0, 
      location: '', 
      description: '' 
    });
    onCancel?.();
  };

  const isEditing = !!editingEvent;

  return (
    <section>
      <h2>{isEditing ? 'Edit Event' : 'Add New Event'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px', maxWidth: '500px' }}>
        <input
          placeholder="Event Name"
          value={form.name}
          onChange={(e) => setForm({...form, name: e.target.value})}
          required
        />
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({...form, date: e.target.value})}
          required
        />
        <input
          type="number"
          placeholder="Quota"
          value={form.quota}
          onChange={(e) => setForm({...form, quota: Number(e.target.value) || 0})}
          min="0"
          required
        />
        <input
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({...form, location: e.target.value})}
          required
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({...form, description: e.target.value})}
          rows={3}
          required
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit">
            {isEditing ? 'Update Event' : 'Create Event'}
          </button>
          {isEditing && onCancel && (
            <button type="button" onClick={handleCancel} style={{ background: '#6c757d' }}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}