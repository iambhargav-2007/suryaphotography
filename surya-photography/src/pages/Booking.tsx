import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, CalendarOff, X, CheckCircle } from 'lucide-react';
import './Booking.css';

// --- Mock Data Generators ---
const generateDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      id: d.toISOString().split('T')[0],
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateNumber: d.getDate(),
      monthName: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      dateLabel: `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' })}`,
      isFull: i === 2 || i === 5,
      fullDateObj: d
    });
  }
  return dates;
};

const mockSlots = [
  { id: 's1', time: '6 PM - 7 PM', title: 'Portrait Session', status: 'available' },
  { id: 's2', time: '7 PM - 8 PM', title: 'Portrait Session', status: 'booked' },
  { id: 's3', time: '8 PM - 9 PM', title: 'Portrait Session', status: 'available' },
  { id: 's4', time: '9 PM - 10 PM', title: 'Portrait Session', status: 'blocked' },
];

const locations = ['Food Court', 'Sklm Campus', 'Main gate', 'Beside Library', 'Open To Suggestions'];

const datesList = generateDates();

const Booking: React.FC = () => {
  const navigate = useNavigate();

  // Selection State
  const [selectedDateId, setSelectedDateId] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  // Form & UI State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Form Data State
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    year: '',
    branch: '',
    location: '',
    notes: ''
  });

  const selectedDate = datesList.find(d => d.id === selectedDateId);
  const selectedSlot = mockSlots.find(s => s.id === selectedSlotId);
  const availableSlotsCount = mockSlots.filter(s => s.status === 'available').length;
  const totalSlotsCount = mockSlots.length;

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

  const handleReserveSession = (e: React.FormEvent) => {
    e.preventDefault();
    // Generate Mock ID
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setBookingId(`SP-${randomNum}`);
    setIsSuccess(true);
  };

  const handleBackToHome = () => {
    document.body.style.overflow = 'auto';
    navigate('/');
  };

  const handleBookAnother = () => {
    setIsSuccess(false);
    setIsFormOpen(false);
    setSelectedDateId(null);
    setSelectedSlotId(null);
    document.body.style.overflow = 'auto';
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(bookingId);
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
                      setSelectedSlotId(null);
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
                {mockSlots.map((slot) => {
                  const isSelected = slot.id === selectedSlotId;
                  return (
                    <motion.button
                      key={slot.id}
                      className={`slot-card ${slot.status} ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        if (slot.status === 'available') {
                          setSelectedSlotId(slot.id);
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
                        {slot.status === 'available' ? 'Available' : slot.status === 'booked' ? 'Booked' : 'Blocked'}
                      </span>
                    </motion.button>
                  );
                })}
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
        {selectedSlotId && selectedDate && !isFormOpen && (
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
                    <span>{selectedSlot?.time}</span>
                  </div>
                  <div className="info-item">
                    <MapPin size={16} />
                    <span>{selectedSlot?.title}</span>
                  </div>
                  <div className="info-price">₹400</div>
                </div>
              </div>

              <div className="summary-details mobile-only">
                 <div className="mobile-summary-text">
                   <span className="mobile-summary-label">Selected:</span>
                   <span className="mobile-summary-value">{selectedSlot?.time}</span>
                 </div>
              </div>

              <button 
                className="btn-continue"
                disabled={!selectedDateId || !selectedSlotId}
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
                        <span>{selectedSlot?.time}</span>
                        <span className="divider">•</span>
                        <span className="text-orange">₹400</span>
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

                      <div className="modal-footer">
                        <button type="submit" className="btn-reserve">Reserve Session</button>
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
                      We'll see you on <strong>{selectedDate?.dateLabel}</strong> at <strong>{selectedSlot?.time?.split(' - ')[0]}</strong>.
                    </p>
                    
                    <div className="success-details-card">
                      <div className="success-detail-row">
                        <span>Photographer</span>
                        <strong>Surya Photography</strong>
                      </div>
                      <div className="success-detail-row">
                        <span>Booking ID</span>
                        <div className="booking-id-copy" onClick={handleCopyId}>
                          <strong className="text-orange">{bookingId}</strong>
                          <span className="copy-btn">{isCopied ? 'Copied!' : 'Copy'}</span>
                        </div>
                      </div>
                      <div className="success-detail-row">
                        <span>Date</span>
                        <strong>{selectedDate?.dateLabel} {selectedDate?.fullDateObj.getFullYear()}</strong>
                      </div>
                      <div className="success-detail-row">
                        <span>Time</span>
                        <strong>{selectedSlot?.time}</strong>
                      </div>
                      <div className="success-detail-row">
                        <span>Price</span>
                        <strong>₹400</strong>
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
