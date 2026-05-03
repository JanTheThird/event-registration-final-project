// pages/student/StudentPage.tsx
import React, { useState, useEffect } from 'react';
import { useDB } from '../../utils/localdb/db';
import type { Event } from '../../utils/types/Index';

export default function StudentPage() {
  const db = useDB();
  const [allUpcomingEvents, setAllUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [today] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    refreshEvents();
  }, [today]);

  const refreshEvents = () => {
    const events = db.getEvents();
    const past = events.filter(event => event.date < today);
    const future = events.filter(event => event.date >= today);
    
    setPastEvents(past);
    setAllUpcomingEvents(future);
    
    // Demo: First 2 upcoming events are registered
    const demoRegistered = future.slice(0, 2);
    setRegisteredEvents(demoRegistered);
  };

  const getDaysUntil = (date: string): number => {
    const eventDate = new Date(date + 'T00:00:00');
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const isRegistered = (eventId: number): boolean => {
    return registeredEvents.some(event => event.id === eventId);
  };

  const toggleRegistration = (event: Event) => {
    if (isRegistered(event.id)) {
      // Unregister - remove from registered list
      setRegisteredEvents(prev => prev.filter(e => e.id !== event.id));
      alert(`✅ Unregistered from "${event.name}"`);
    } else {
      // Register - add to registered list
      setRegisteredEvents(prev => [...prev, event]);
      alert(`🎉 Successfully registered for "${event.name}"!`);
    }
  };

  // Filter out registered events from upcoming
  const availableUpcomingEvents = allUpcomingEvents.filter(
    event => !isRegistered(event.id)
  );

  const getRegistrationButton = (event: Event): React.ReactNode => {
    const registered = isRegistered(event.id);
    return (
      <button
        onClick={() => toggleRegistration(event)}
        style={{
          padding: '12px 24px',
          border: 'none',
          borderRadius: '25px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          minWidth: '140px',
          boxShadow: registered 
            ? '0 4px 15px rgba(220, 53, 69, 0.4)' 
            : '0 4px 15px rgba(40, 167, 69, 0.4)',
          background: registered ? '#dc3545' : '#28a745',
          color: 'white'
        }}
        disabled={event.date < today}
      >
        {registered ? '❌ Unregister' : '✅ Register'}
      </button>
    );
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '10px' }}>Student Portal</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '40px', fontSize: '18px' }}>
        Browse and register for upcoming events!
      </p>
      
      {/* Stats - Updated counts */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', padding: '20px 30px', background: '#e8f5e8', borderRadius: '16px', minWidth: '180px' }}>
            <h3 style={{ margin: '0', color: '#2e7d32' }}>Registered</h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2e7d32' }}>{registeredEvents.length}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '20px 30px', background: '#e3f2fd', borderRadius: '16px', minWidth: '180px' }}>
            <h3 style={{ margin: '0', color: '#1976d2' }}>Available</h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1976d2' }}>{availableUpcomingEvents.length}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '20px 30px', background: '#f5f5f5', borderRadius: '16px', minWidth: '180px' }}>
            <h3 style={{ margin: '0', color: '#666' }}>Past</h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#666' }}>{pastEvents.length}</div>
          </div>
        </div>
      </div>

      {/* 1. My Registered Events - ONLY registered events */}
      <section style={{ marginBottom: '50px' }}>
        <h2 style={{ color: '#28a745', marginBottom: '25px' }}>My Registered Events ({registeredEvents.length})</h2>
        {registeredEvents.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '30px' }}>
            {registeredEvents.map((event) => (
              <div key={event.id} style={{
                border: '3px solid #28a745',
                borderRadius: '20px',
                padding: '30px',
                background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
                boxShadow: '0 10px 30px rgba(40, 167, 69, 0.3)',
                position: 'relative'
              }}>
                <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                  <span style={{
                    background: '#28a745',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '25px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    REGISTERED ✓
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, color: '#155724', fontSize: '28px' }}>{event.name}</h3>
                  <span style={{
                    background: '#28a745',
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
                <div style={{ marginTop: '25px', textAlign: 'center' }}>
                  {getRegistrationButton(event)}
                </div>
              </div>
            ))}
          </div>
        ) : (
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
        )}
      </section>

      {/* 2. Available Upcoming Events - EXCLUDES registered ones */}
      <section style={{ marginBottom: '50px' }}>
        <h2 style={{ color: '#1976d2', marginBottom: '25px' }}>
          Available Upcoming Events ({availableUpcomingEvents.length})
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '30px' }}>
          {availableUpcomingEvents.map((event) => (
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
              <div style={{ marginTop: '25px', textAlign: 'center' }}>
                {getRegistrationButton(event)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Past Events - No changes */}
      <section>
        <h2 style={{ color: '#666', marginBottom: '25px' }}>Past Events ({pastEvents.length})</h2>
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