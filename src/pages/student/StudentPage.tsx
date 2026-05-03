// pages/student/StudentPage.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDB } from '../../utils/localdb/db';
import type { Event } from '../../utils/types/Index';

export default function StudentPage() {
  const db = useDB();
  const [allUpcomingEvents, setAllUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [today] = useState(new Date().toISOString().split('T')[0]);
  const [openNotificationDropdown, setOpenNotificationDropdown] = useState<number | null>(null);

  useEffect(() => {
    refreshEvents();
  }, [today]);

  // FIXED: Proper click outside handler with useRef and useCallback
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setOpenNotificationDropdown(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const refreshEvents = () => {
    const events = db.getEvents();
    const past = events.filter(event => event.date < today);
    const future = events.filter(event => event.date >= today);
    
    setPastEvents(past);
    setAllUpcomingEvents(future);
    
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
      setRegisteredEvents(prev => prev.filter(e => e.id !== event.id));
      alert(`✅ Unregistered from "${event.name}"`);
    } else {
      setRegisteredEvents(prev => [...prev, event]);
      alert(`🎉 Successfully registered for "${event.name}"!`);
    }
  };

  const handleNotifyLater = (event: Event, days: number) => {
    const daysUntil = getDaysUntil(event.date);
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + days);
    
    alert(
      `⏰ Reminder scheduled for "${event.name}"!\n\n` +
      `📅 Event in ${daysUntil} days (${event.date})\n` +
      `🔔 Reminder ${days === 1 ? 'in 1 day' : days === 7 ? 'in 1 week' : 'in 1 month'}\n` +
      `📱 Push + Email notification\n` +
      `✅ Scheduled for ${reminderDate.toLocaleDateString()}`
    );
    
    setOpenNotificationDropdown(null);
  };

  const toggleNotificationDropdown = (eventId: number) => {
    setOpenNotificationDropdown(openNotificationDropdown === eventId ? null : eventId);
  };

  // FIXED: Remove duplicate declaration - only define once
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

  const getRegisteredEventButtons = (event: Event): React.ReactNode => {
    const daysUntilEvent = getDaysUntil(event.date);
    const isDropdownOpen = openNotificationDropdown === event.id;
    
    const canNotifyIn1Day = daysUntilEvent > 1;
    const canNotifyIn1Week = daysUntilEvent > 7;
    const canNotifyIn1Month = daysUntilEvent > 30;
    
    const allOptionsAvailable = canNotifyIn1Day && canNotifyIn1Week && canNotifyIn1Month;
    const someOptionsDisabled = !allOptionsAvailable;

    return (
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        justifyContent: 'center', 
        flexWrap: 'wrap',
        marginTop: '10px'
      }}>
        {/* Unregister Button */}
        <button
          onClick={() => toggleRegistration(event)}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '20px',
            fontSize: '15px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            minWidth: '120px',
            boxShadow: '0 4px 15px rgba(220, 53, 69, 0.4)',
            background: '#dc3545',
            color: 'white'
          }}
        >
          ❌ Unregister
        </button>
        
        {/* Notify Me Later - CLICK TO TOGGLE */}
        <div ref={dropdownRef} style={{
          position: 'relative',
          minWidth: '140px'
        }}>
          <button
            onClick={() => toggleNotificationDropdown(event.id)}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '20px',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              width: '100%',
              minWidth: '140px',
              boxShadow: someOptionsDisabled 
                ? '0 4px 15px rgba(156, 163, 175, 0.4)' 
                : '0 4px 15px rgba(245, 158, 11, 0.4)',
              background: someOptionsDisabled 
                ? 'linear-gradient(135deg, #9ca3af, #d1d5db)' 
                : 'linear-gradient(135deg, #f59e0b, #fbbf24)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <span>⏰</span>
            <span>Notify Later</span>
            <span style={{ 
              fontSize: '12px', 
              transition: 'transform 0.3s ease',
              transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
            }}>
              ▼
            </span>
            {someOptionsDisabled && (
              <span style={{ fontSize: '12px', marginLeft: '4px' }}>⚠️</span>
            )}
          </button>
          
          {/* DROPDOWN - Shows on CLICK */}
          {isDropdownOpen && daysUntilEvent > 1 && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
              marginTop: '4px',
              zIndex: 1000,
              border: '1px solid #e5e7eb',
              animation: 'slideDown 0.2s ease-out'
            }}>
              {/* 1 Day Option */}
              <button
                onClick={() => handleNotifyLater(event, 1)}
                disabled={!canNotifyIn1Day}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: '14px 16px',
                  border: 'none',
                  background: canNotifyIn1Day ? 'white' : '#f9fafb',
                  color: canNotifyIn1Day ? '#374151' : '#9ca3af',
                  textAlign: 'left',
                  fontSize: '15px',
                  fontWeight: '500',
                  cursor: canNotifyIn1Day ? 'pointer' : 'not-allowed',
                  borderBottom: '1px solid #f3f4f6',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (canNotifyIn1Day) {
                    e.currentTarget.style.background = '#f8fafc';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = canNotifyIn1Day ? 'white' : '#f9fafb';
                }}
              >
                <span style={{ marginRight: '12px', fontSize: '18px' }}>📅</span>
                1 Day
                {!canNotifyIn1Day && (
                  <span style={{ 
                    fontSize: '12px', 
                    marginLeft: '8px', 
                    color: '#ef4444',
                    background: '#fef2f2',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontWeight: '500'
                  }}>
                    Event tomorrow
                  </span>
                )}
              </button>
              
              {/* 1 Week Option */}
              <button
                onClick={() => handleNotifyLater(event, 7)}
                disabled={!canNotifyIn1Week}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: '14px 16px',
                  border: 'none',
                  background: canNotifyIn1Week ? 'white' : '#f9fafb',
                  color: canNotifyIn1Week ? '#374151' : '#9ca3af',
                  textAlign: 'left',
                  fontSize: '15px',
                  fontWeight: '500',
                  cursor: canNotifyIn1Week ? 'pointer' : 'not-allowed',
                  borderBottom: '1px solid #f3f4f6',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (canNotifyIn1Week) {
                    e.currentTarget.style.background = '#f8fafc';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = canNotifyIn1Week ? 'white' : '#f9fafb';
                }}
              >
                <span style={{ marginRight: '12px', fontSize: '18px' }}>📆</span>
                1 Week
                {!canNotifyIn1Week && (
                  <span style={{ 
                    fontSize: '12px', 
                    marginLeft: '8px', 
                    color: '#ef4444',
                    background: '#fef2f2',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontWeight: '500'
                  }}>
                    Less than 1 week
                  </span>
                )}
              </button>
              
              {/* 1 Month Option */}
              <button
                onClick={() => handleNotifyLater(event, 30)}
                disabled={!canNotifyIn1Month}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: '14px 16px',
                  border: 'none',
                  background: canNotifyIn1Month ? 'white' : '#f9fafb',
                  color: canNotifyIn1Month ? '#374151' : '#9ca3af',
                  textAlign: 'left',
                  fontSize: '15px',
                  fontWeight: '500',
                  cursor: canNotifyIn1Month ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (canNotifyIn1Month) {
                    e.currentTarget.style.background = '#f8fafc';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = canNotifyIn1Month ? 'white' : '#f9fafb';
                }}
              >
                <span style={{ marginRight: '12px', fontSize: '18px' }}>📅</span>
                1 Month
                {!canNotifyIn1Month && (
                  <span style={{ 
                    fontSize: '12px', 
                    marginLeft: '8px', 
                    color: '#ef4444',
                    background: '#fef2f2',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontWeight: '500'
                  }}>
                    Less than 1 month
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '10px' }}>Student Portal</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '40px', fontSize: '18px' }}>
        Browse and register for upcoming events!
      </p>
      
      {/* Stats */}
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

      {/* My Registered Events */}
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
                
                <div style={{ marginTop: '25px' }}>
                  {getRegisteredEventButtons(event)}
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

      {/* Available Upcoming Events */}
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

      {/* Past Events */}
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