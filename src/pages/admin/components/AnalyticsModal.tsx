export default function AnalyticsModal({
  event,
  analytics,
  onClose
}: any) {
  if (!event || !analytics) return null;

  return (
    <div>
      <h2>{event.name} Analytics</h2>
      <button onClick={onClose}>X</button>

      <p>Total Registered: {analytics.totalRegistered}</p>
      <p>Quota: {analytics.quota}</p>
      <p>Status: {analytics.status}</p>
    </div>
  );
}