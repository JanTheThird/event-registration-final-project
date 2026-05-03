// pages/student/StudentPage.tsx
import React, { useState, useEffect } from 'react';
import { useDB } from '../../utils/localdb/db';
import type { Event } from '../../utils/types/Index';

export default function StudentPage() {
  const db = useDB();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [today] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const events = db.getEvents();

    // No registered → All upcoming or past
    const past = events.filter(event => event.date < today);
    const future = events.filter(event => event.date >= today);
    
    setPastEvents(past);
    setUpcomingEvents(future);
  }, [today]);

  const getDaysUntil = (date: string): number => {
    const eventDate = new Date(date + 'T00:00:00');
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Student Portal</h1>
      
      {/* 3 Stats - Registered = 0 */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', padding: '20px 30px', background: '#fff3e0', borderRadius: '16px', minWidth: '180px' }}>
            <h3 style={{ margin: '0', color: '#f57c00' }}>Registered</h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f57c00' }}>0</div>
          </div>
          <div style={{ textAlign: 'center', padding: '20px 30px', background: '#e8f5e8', borderRadius: '16px', minWidth: '180px' }}>
            <h3 style={{ margin: '0', color: '#2e7d32' }}>Upcoming</h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2e7d32' }}>{upcomingEvents.length}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '20px 30px', background: '#f5f5f5', borderRadius: '16px', minWidth: '180px' }}>
            <h3 style={{ margin: '0', color: '#666' }}>Past</h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#666' }}>{pastEvents.length}</div>
          </div>
        </div>
      </div>

      {/* 1. Registered Events - EMPTY */}
      <section style={{ marginBottom: '50px' }}>
        <h2>Registered Events (0)</h2>
        <div style={{ 
          textAlign: 'center', 
          padding: '80px 40px', 
          background: '#fff8e1', 
          border: '2px dashed #ff9800',
          borderRadius: '20px',
          color: '#f57c00'
        }}>
          <h3 style={{ marginBottom: '15px' }}>No Events Registered Yet</h3>
          <p style={{ fontSize: '18px', margin: 0 }}>
            Register for upcoming events below!
          </p>
        </div>
      </section>

      {/* 2. Upcoming Events */}
      <section style={{ marginBottom: '50px' }}>
        <h2>Upcoming Events ({upcomingEvents.length})</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '30px' }}>
          {upcomingEvents.map((event) => (
            <div key={event.id} style={{
              border: '3px solid #4caf50',
              borderRadius: '20px',
              padding: '30px',
              background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
              boxShadow: '0 10px 30px rgba(76, 175, 80, 0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#2e7d32', fontSize: '28px' }}>{event.name}</h3>
                <span style={{
                  background: '#4caf50',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '30px',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  {getDaysUntil(event.date)} days
                </span>
              </div>
              <p style={{ margin: '15px 0', fontSize: '18px' }}><strong>Date:</strong> {event.date}</p>
              <p style={{ margin: '10px 0', fontSize: '17px' }}><strong>Location:</strong> {event.location}</p>
              <p style={{ margin: '10px 0', fontSize: '16px', color: '#666' }}>{event.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Past Events */}
      <section>
        <h2>Past Events ({pastEvents.length})</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '30px' }}>
          {pastEvents.map((event) => (
            <div key={event.id} style={{
              border: '2px solid #e0e0e0',
              borderRadius: '20px',
              padding: '30px',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #f0f0f0 100%)'
            }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#666', fontSize: '24px' }}>{event.name}</h3>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                <div style={{ textAlign: 'center', padding: '10px 15px', background: '#e9ecef', borderRadius: '12px' }}>
                  <strong style={{ color: '#495057', fontSize: '16px' }}>{event.date}</strong>
                </div>
                <div style={{ textAlign: 'center', padding: '10px 15px', background: '#e9ecef', borderRadius: '12px' }}>
                  <strong style={{ color: '#495057', fontSize: '16px' }}>{event.location}</strong>
                </div>
              </div>
              <p style={{ margin: 0, color: '#6c757d', fontSize: '16px' }}>
                {event.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}