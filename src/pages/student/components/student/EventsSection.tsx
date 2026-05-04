export default function EventsSection({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginTop: '40px' }}>
      <h2>{title}</h2>
      <div className="events-grid">
        {children}
      </div>
    </section>
  );
}