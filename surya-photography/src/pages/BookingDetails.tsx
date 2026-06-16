import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Ticket } from 'lucide-react';
import './Booking.css';

const BookingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="booking-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="booking-glow-bg" />
      
      <div style={{ width: '100%', maxWidth: '800px', marginBottom: '2rem' }}>
        <Link to="/" className="back-link">
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </Link>
      </div>

      <div style={{ 
        background: 'rgba(255, 255, 255, 0.03)', 
        border: '1px solid rgba(255, 255, 255, 0.1)', 
        borderRadius: '16px', 
        padding: '3rem 2rem', 
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        <Ticket size={48} className="text-orange" style={{ margin: '0 auto 1.5rem auto' }} />
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '0.5rem' }}>Your Ticket</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
          Present this ID to the photographer at your session.
        </p>

        <div style={{ 
          background: 'rgba(0, 0, 0, 0.5)', 
          padding: '2rem', 
          borderRadius: '12px',
          border: '1px dashed rgba(249, 115, 22, 0.5)'
        }}>
          <p style={{ textTransform: 'uppercase', fontSize: '0.8rem', color: 'var(--color-text-secondary)', letterSpacing: '2px', marginBottom: '0.5rem' }}>
            Booking ID
          </p>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
            {id}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
