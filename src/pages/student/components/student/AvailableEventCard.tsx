import type { Event } from '../../../../utils/types/Index';

export default function AvailableEventCard({
  event,
  onRegister
}: {
  event: Event;
  onRegister: () => void;
}) {
  return (
    <div className="card-base card-available">
      <h3>{event.name}</h3>
      <p>{event.date}</p>
      <button onClick={onRegister} className="btn-register-main">
        Register
      </button>
    </div>
  );
}