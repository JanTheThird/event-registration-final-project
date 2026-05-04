export default function EventsSection({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="events-section">
      <h2>{title}</h2>
      <div className="events-grid">
        {children}
      </div>
    </section>
  );
}