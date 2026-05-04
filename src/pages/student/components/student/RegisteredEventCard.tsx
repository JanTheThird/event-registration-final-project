import type { Event } from '../../../../utils/types/Index';

export default function RegisteredEventCard({
  event,
  daysUntil,
  isDropdownOpen,
  onToggleDropdown,
  onUnregister,
  onNotify
}: {
  event: Event;
  daysUntil: number;
  isDropdownOpen: boolean;
  onToggleDropdown: () => void;
  onUnregister: () => void;
  onNotify: (days: number) => void;
}) {
  const urgent = daysUntil <= 3;

  return (
    <div
      className={`card-base card-registered${urgent ? ' card-urgent' : ''}`}
    >
      <h3>{event.name}</h3>
      <p>{event.date} ({daysUntil} days left)</p>

      <div className="btn-flex-row">
        <button onClick={onUnregister} className="btn-unregister">
          Unregister
        </button>

        <div className="relative-wrapper">
          <button onClick={onToggleDropdown} className="btn-notify">
            Notify Later
          </button>

          {isDropdownOpen && (
            <div className="custom-dropdown-menu">
              <div onClick={() => onNotify(1)} className="dropdown-action-item">
                1 Day Before
              </div>
              <div onClick={() => onNotify(7)} className="dropdown-action-item">
                1 Week Before
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}