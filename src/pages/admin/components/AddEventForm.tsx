import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import type { Event } from '../../../utils/types/Index';

export interface EventFormData {
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
  onCancel,
}: AddEventFormProps) {
  const emptyForm = useMemo<EventFormData>(
    () => ({
      name: '',
      date: new Date().toISOString().split('T')[0],
      quota: 10,
      location: '',
      description: '',
    }),
    []
  );
  const [form, setForm] = useState<EventFormData>(emptyForm);
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EventFormData>({
    defaultValues: emptyForm,
  });

  // Populate form when editing
  useEffect(() => {
    if (editingEvent) {
      const eventForm: EventFormData = {
        id: editingEvent.id,
        name: editingEvent.name,
        date: editingEvent.date,
        quota: editingEvent.quota,
        location: editingEvent.location || '',
        description: editingEvent.description || '',
      };
      setForm(eventForm);
      reset(eventForm);
    } else {
      setForm(emptyForm);
      reset(emptyForm);
    }
  }, [editingEvent, reset, emptyForm]);


  const onSubmit = (data: EventFormData) => {
    const payload = { ...form, ...data };
    if (editingEvent && onUpdate) {
      onUpdate(payload);
    } else {
      onAdd(payload);
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    reset(emptyForm);
    onCancel?.();
  };

  const isEditing = !!editingEvent;

  return (
    <section>
      <h2>{isEditing ? 'Edit Event' : 'Add New Event'}</h2>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: '10px', maxWidth: '500px' }}>
        <input
          placeholder="Event Name"
          value={form.name}
          {...register('name', { required: 'Event name is required' })}
          onChange={(e) => {
            setValue('name', e.target.value, { shouldValidate: true });
            setForm({ ...form, name: e.target.value });
          }}
          required
        />
        {errors.name && <span className="error-message">{errors.name.message}</span>}
        <input
          type="date"
          value={form.date}
          {...register('date', { required: 'Date is required' })}
          onChange={(e) => {
            setValue('date', e.target.value, { shouldValidate: true });
            setForm({ ...form, date: e.target.value });
          }}
          required
        />
        {errors.date && <span className="error-message">{errors.date.message}</span>}
        <input
          type="number"
          placeholder="Quota"
          value={form.quota}
          {...register('quota', {
            min: { value: 0, message: 'Quota must be 0 or more' },
            valueAsNumber: true,
          })}
          onChange={(e) => {
            const quotaValue = Number(e.target.value) || 0;
            setValue('quota', quotaValue, { shouldValidate: true });
            setForm({ ...form, quota: quotaValue });
          }}
          min="0"
          required
        />
        {errors.quota && <span className="error-message">{errors.quota.message}</span>}
        <input
          placeholder="Location"
          value={form.location}
          {...register('location', { required: 'Location is required' })}
          onChange={(e) => {
            setValue('location', e.target.value, { shouldValidate: true });
            setForm({ ...form, location: e.target.value });
          }}
          required
        />
        {errors.location && <span className="error-message">{errors.location.message}</span>}
        <textarea
          placeholder="Description"
          value={form.description}
          {...register('description', { required: 'Description is required' })}
          onChange={(e) => {
            setValue('description', e.target.value, { shouldValidate: true });
            setForm({ ...form, description: e.target.value });
          }}
          rows={3}
          required
        />
        {errors.description && <span className="error-message">{errors.description.message}</span>}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit">
            {isEditing ? 'Update Event' : 'Create Event'}
          </button>
          {isEditing && onCancel && (
            <button type="button" onClick={handleCancel} className="btn-unregister">
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}