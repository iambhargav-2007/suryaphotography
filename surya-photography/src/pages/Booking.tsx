import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, CalendarOff, X, CheckCircle } from 'lucide-react';
import './Booking.css';

import { API_BASE_URL } from '../config/api';

// --- Types ---
interface DateItem {
  id: string;
  dayName: string;
  dateNumber: number;
  monthName: string;
  dateLabel: string;
  isFull: boolean;
  fullDateObj: Date;
}

interface SlotItem {
  id: string;
  time: string;
  title: string;
  status: 'available' | 'booked' | 'pending' | 'blocked';
}

const locations = ['Food Court', 'Sklm Campus', 'Main gate', 'Beside Library', 'Open To Suggestions'];

const Booking: React.FC = () => {
  const navigate = useNavigate();

  // Selection State
  const [selectedDateId, setSelectedDateId] = useState<string | null>(null);
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);

  // Form & UI State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingIds, setBookingIds] = useState<string[]>([]);
  const [isCopied, setIsCopied] = useState(false);

  // Form Data State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    year: '',
    branch: '',
    location: '',
    notes: ''
  });

  const [datesList, setDatesList] = useState<DateItem[]>([]);
  const [slotsList, setSlotsList] = useState<SlotItem[]>([]);
  const [loadingDates, setLoadingDates] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch upcoming availability
  useEffect(() => {
    const fetchDates = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/bookings/availability`);
        if (!res.ok) throw new Error('Failed to fetch dates');
        const data = await res.json();
        
        const formattedDates = data.map((item: any) => {
          const d = new Date(item.date);
          const today = new Date();
          const todayStr = today.toISOString().split('T')[0];
          
          let dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
          if (item.date === todayStr) dayName = 'Today';
          else {
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            if (item.date === tomorrow.toISOString().split('T')[0]) dayName = 'Tomorrow';
          }

          return {
            id: item.date,
            dayName,
            dateNumber: d.getDate(),
            monthName: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
            dateLabel: `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' })}`,
            isFull: item.booked >= 4,
            fullDateObj: d
          };
        });
        
        setDatesList(formattedDates);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDates(false);
      }
    };
    fetchDates();
  }, []);

  // Fetch slots when a date is selected
  useEffect(() => {
    if (!selectedDateId) {
      setSlotsList([]);
      return;
    }
    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const res = await fetch(`${API_BASE_URL}/bookings/availability/${selectedDateId}`);
        if (!res.ok) throw new Error('Failed to fetch slots');
        const data = await res.json();
        
        const formattedSlots = data.map((item: any) => {
          let timeLabel = item.slot;
          if (item.slot === '6PM') timeLabel = '6 PM - 7 PM';
          if (item.slot === '7PM') timeLabel = '7 PM - 8 PM';
          if (item.slot === '8PM') timeLabel = '8 PM - 9 PM';
          if (item.slot === '9PM') timeLabel = '9 PM - 10 PM';
          
          return {
            id: item.slot,
            time: timeLabel,
            title: 'Portrait Session',
            status: item.status.toLowerCase() as 'available' | 'booked' | 'pending' | 'blocked'
          };
        });
        
        setSlotsList(formattedSlots);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedDateId]);

  const selectedDate = datesList.find(d => d.id === selectedDateId);
  const selectedSlots = slotsList.filter(s => selectedSlotIds.includes(s.id));
  const availableSlotsCount = slotsList.filter(s => s.status === 'available').length;
  const totalSlotsCount = slotsList.length;

  // Handlers
  const handleContinueBooking = () => {
    setIsFormOpen(true);
    // Lock body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    if (isSuccess) return; // Prevent closing success manually if desired
    setIsFormOpen(false);
    document.body.style.overflow = 'auto';
  };

  const handleReserveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');
    setIsSubmitting(true);
    
    try {
      const payload = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.mobile,
        year: formData.year,
        branch: formData.branch,
        preferredLocation: formData.location,
        notes: formData.notes,
        date: selectedDateId,
        slots: selectedSlotIds
      };
      
      const res = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create booking');
      }
      
      setBookingIds(data.bookingIds);
      setIsSuccess(true);
    } catch (err: any) {
      setBookingError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToHome = () => {
    document.body.style.overflow = 'auto';
    navigate('/');
  };

  const handleBookAnother = () => {
    setIsSuccess(false);
    setIsFormOpen(false);
    setSelectedDateId(null);
    setSelectedSlotIds([]);
    document.body.style.overflow = 'auto';
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(bookingIds.join(', '));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Cleanup body scroll on unmount
  useEffect(() => {
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  return (
    <div className="booking-page">
      <motion.div 
        className="booking-glow-bg"
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="booking-container">
        
        <Link to="/" className="back-link">
          <ArrowLeft size={20} />
          <span>Back to Portfolio</span>
        </Link>

        {/* Progress Indicator */}
        <div className="booking-progress">
          <span className="progress-step completed">Select Date</span>
          <span className="progress-divider">→</span>
          <span className={`progress-step ${selectedDateId ? 'completed' : ''}`}>Choose Time</span>
          <span className="progress-divider">→</span>
          <span className={`progress-step ${isFormOpen ? 'completed' : ''}`}>Booking Details</span>
        </div>

        <header className="booking-header">
          <h1 className="booking-title">Reserve Your Portrait Session</h1>
          <div className="scarcity-badge">
            <span>✨</span> Only 4 portrait sessions available daily.
          </div>
        </header>

        {/* Section 1: Date Selection */}
        <section className="booking-section">
          <div className="date-strip-container">
            <div className="date-strip">
              {datesList.map((date) => {
                const isSelected = date.id === selectedDateId;
                return (
                  <motion.button
                    key={date.id}
                    className={`date-card ${isSelected ? 'selected' : ''} ${date.isFull ? 'full' : ''}`}
                    onClick={() => {
                      setSelectedDateId(date.id);
                      setSelectedSlotIds([]);
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="date-month">{date.monthName}</span>
                    <span className="date-number">{date.dateNumber}</span>
                    <span className="date-day">{date.dayName}</span>
                    {date.isFull && <span className="date-full-label">Full</span>}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 2: Slot Selection */}
        <AnimatePresence mode="wait">
          {selectedDateId && !selectedDate?.isFull && (
            <motion.section 
              key="slots"
              className="booking-section"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: '1.5rem' }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="section-header-row">
                <h3 className="section-heading">Available Sessions</h3>
                <span className="session-count-badge">
                  {availableSlotsCount} of {totalSlotsCount} Sessions Available
                </span>
              </div>
              <p className="section-subheading">For {selectedDate?.dateLabel}, {selectedDate?.fullDateObj.getFullYear()}</p>
              
              <div className="slots-grid">
                {loadingSlots ? (
                  <p>Loading slots...</p>
                ) : (
                  slotsList.map((slot) => {
                    const isSelected = selectedSlotIds.includes(slot.id);
                    return (
                      <motion.button
                        key={slot.id}
                        className={`slot-card ${slot.status} ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          if (slot.status === 'available') {
                            if (selectedSlotIds.includes(slot.id)) {
                              setSelectedSlotIds(selectedSlotIds.filter(id => id !== slot.id));
                            } else {
                              setSelectedSlotIds([...selectedSlotIds, slot.id]);
                            }
                          }
                        }}
                        whileTap={slot.status === 'available' ? { scale: 0.95 } : {}}
                        animate={isSelected ? { scale: 1.02 } : { scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="slot-details">
                          <span className="slot-time">{slot.time}</span>
                          <span className="slot-title">{slot.title}</span>
                        </div>
                        <span className="slot-status">
                          {slot.status === 'available' ? 'Available' : slot.status === 'booked' ? 'Booked' : slot.status === 'pending' ? 'Pending' : 'Blocked'}
                        </span>
                      </motion.button>
                    );
                  })
                )}
              </div>
            </motion.section>
          )}

          {selectedDateId && selectedDate?.isFull && (
            <motion.section
              key="empty"
              className="booking-section empty-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <CalendarOff size={48} className="empty-icon" />
              <h3 className="empty-heading">No Sessions Available</h3>
              <p className="empty-subheading">Please choose another date.</p>
            </motion.section>
          )}
        </AnimatePresence>

      </div>

      {/* Floating Summary & CTA */}
      <AnimatePresence>
        {selectedSlotIds.length > 0 && selectedDate && !isFormOpen && (
          <motion.div 
            className="floating-summary-container"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          >
            <div className="summary-card">
              <div className="summary-details desktop-only">
                <div className="summary-header">Your Session</div>
                <div className="summary-info">
                  <div className="info-item">
                    <Calendar size={16} />
                    <span>{selectedDate.dateLabel} {selectedDate.fullDateObj.getFullYear()}</span>
                  </div>
                  <div className="info-item">
                    <Clock size={16} />
                    <span>{selectedSlots.map(s => s.time).join(', ')}</span>
                  </div>
                  <div className="info-item">
                    <MapPin size={16} />
                    <span>{selectedSlots[0]?.title}</span>
                  </div>
                  <div className="info-price">₹{selectedSlotIds.length * 400}</div>
                </div>
              </div>

              <div className="summary-details mobile-only">
                 <div className="mobile-summary-text">
                   <span className="mobile-summary-label">Selected:</span>
                   <span className="mobile-summary-value">{selectedSlots.map(s => s.time).join(', ')}</span>
                 </div>
              </div>

              <button 
                className="btn-continue"
                disabled={!selectedDateId || selectedSlotIds.length === 0}
                onClick={handleContinueBooking}
              >
                Continue Booking
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- BOTTOM SHEET / MODAL --- */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            {/* Overlay */}
            <motion.div 
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
            />

            {/* Modal Content */}
            <motion.div 
              className={`modal-container ${isSuccess ? 'success-mode' : ''}`}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              {!isSuccess ? (
                <>
                  {/* Form Mode */}
                  <div className="modal-drag-handle mobile-only" />
                  
                  <div className="modal-header">
                    <div className="modal-header-text">
                      <h2>Complete Your Booking</h2>
                      <p>Almost done. Tell us a little about yourself.</p>
                    </div>
                    <button className="modal-close" onClick={handleCloseModal}>
                      <X size={24} />
                    </button>
                  </div>

                  <div className="modal-body">
                    {/* Sticky Session Summary */}
                    <div className="modal-sticky-summary">
                      <div className="sticky-summary-content">
                        <span>{selectedDate?.dateLabel} {selectedDate?.fullDateObj.getFullYear()}</span>
                        <span className="divider">•</span>
                        <span>{selectedSlots.map(s => s.time).join(', ')}</span>
                        <span className="divider">•</span>
                        <span className="text-orange">₹{selectedSlotIds.length * 400}</span>
                      </div>
                    </div>

                    <form className="booking-form" onSubmit={handleReserveSession}>
                      <div className="form-group">
                        <label>Full Name *</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="Enter your full name" 
                          value={formData.fullName}
                          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        />
                      </div>

                      <div className="form-group">
                        <label>Email Address *</label>
                        <input 
                          type="email" 
                          required 
                          placeholder="your.email@example.com" 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>

                      <div className="form-group">
                        <label>Mobile Number *</label>
                        <input 
                          type="tel" 
                          inputMode="numeric" 
                          required 
                          placeholder="10-digit mobile number"
                          value={formData.mobile}
                          onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Year *</label>
                          <input 
                            type="text"
                            required
                            placeholder="e.g. 1st Year"
                            value={formData.year}
                            onChange={(e) => setFormData({...formData, year: e.target.value})}
                          />
                        </div>

                        <div className="form-group">
                          <label>Branch (Optional)</label>
                          <input 
                            type="text"
                            placeholder="e.g. CSE"
                            value={formData.branch}
                            onChange={(e) => setFormData({...formData, branch: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Preferred Location</label>
                        <div className="location-cards-grid">
                          {locations.map(loc => (
                            <button
                              key={loc}
                              type="button"
                              className={`location-card ${formData.location === loc ? 'selected' : ''}`}
                              onClick={() => setFormData({...formData, location: loc})}
                            >
                              {loc}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Notes</label>
                        <textarea 
                          placeholder="Anything you'd like the photographer to know?"
                          rows={3}
                          value={formData.notes}
                          onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        />
                      </div>

                      {bookingError && <p className="error-text" style={{color: 'red', fontSize: '0.875rem', marginBottom: '1rem'}}>{bookingError}</p>}
                      <div className="modal-footer">
                        <button type="submit" className="btn-reserve" disabled={isSubmitting}>
                          {isSubmitting ? 'Reserving...' : 'Reserve Session'}
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              ) : (
                <>
                  {/* Success Mode */}
                  <div className="success-screen">
                    <motion.div 
                      className="success-icon-wrapper"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", damping: 20, stiffness: 100 }}
                    >
                      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="40" cy="40" r="36" stroke="var(--color-primary)" strokeWidth="6" strokeOpacity="0.2"/>
                        <motion.circle 
                          cx="40" cy="40" r="36" 
                          stroke="var(--color-primary)" 
                          strokeWidth="6"
                          strokeDasharray="226"
                          strokeDashoffset="226"
                          strokeLinecap="round"
                          animate={{ strokeDashoffset: 0 }}
                          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                          transform="rotate(-90 40 40)"
                        />
                        <motion.path 
                          d="M26 40L36 50L54 30" 
                          stroke="var(--color-primary)" 
                          strokeWidth="6" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.6, ease: "easeOut", delay: 0.8 }}
                        />
                      </svg>
                    </motion.div>
                    
                    <h2 className="success-title">Session Reserved</h2>
                    <p className="success-subtitle">
                      Your portrait session has been successfully reserved.<br/>
                      We'll see you on <strong>{selectedDate?.dateLabel}</strong> at <strong>{selectedSlots.map(s => s.time?.split(' - ')[0]).join(', ')}</strong>.
                    </p>
                    
                    <div className="success-details-card">
                      <div className="success-detail-row">
                        <span>Photographer</span>
                        <strong>Surya Photography</strong>
                      </div>
                      <div className="success-detail-row">
                        <span>Booking IDs</span>
                        <div className="booking-id-copy" onClick={handleCopyId}>
                          <strong className="text-orange">{bookingIds.join(', ')}</strong>
                          <span className="copy-btn">{isCopied ? 'Copied!' : 'Copy'}</span>
                        </div>
                      </div>
                      <div className="success-detail-row">
                        <span>Date</span>
                        <strong>{selectedDate?.dateLabel} {selectedDate?.fullDateObj.getFullYear()}</strong>
                      </div>
                      <div className="success-detail-row">
                        <span>Time</span>
                        <strong>{selectedSlots.map(s => s.time).join(', ')}</strong>
                      </div>
                      <div className="success-detail-row">
                        <span>Price</span>
                        <strong>₹{selectedSlotIds.length * 400}</strong>
                      </div>
                    </div>

                    <div className="success-actions">
                      <button 
                        className="btn-secondary-ghost" 
                        onClick={handleBookAnother}
                      >
                        Book Another Session
                      </button>
                      <button className="btn-reserve" onClick={handleBackToHome}>Back To Home</button>
                    </div>

                    <p className="cancellation-info">
                      Need to cancel? Use your Booking ID from the booking management page.
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Booking;
