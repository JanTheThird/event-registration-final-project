import type { Event } from '../../../utils/types/Index';

export default function EventCard({
  event,
  onEdit,
  onDelete,
  onAnalytics
}: {
  event: Event;
  onEdit: () => void;
  onDelete: () => void;
  onAnalytics: () => void;
}) {
  return (
    <div>
      <h3>{event.name}</h3>
      <p>{event.location}</p>
      <p>{event.description}</p>

      <button onClick={onAnalytics}>Analytics</button>
      <button onClick={onEdit}>Edit</button>
      <button onClick={onDelete}>Delete</button>
    </div>
  );
}