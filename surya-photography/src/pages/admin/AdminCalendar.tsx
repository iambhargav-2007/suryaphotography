import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Users, Settings, LayoutDashboard, X, ChevronRight, ChevronDown, MessageCircle, Phone, Trash2, PlusCircle, Ban, Unlock, CheckCircle2, Plus } from 'lucide-react';
import './Admin.css';

// --- Types & Mock Data ---
type SlotStatus = 'available' | 'booked' | 'blocked';
type DateState = 'available' | 'partial' | 'full' | 'blocked';

interface Slot {
  id: string;
  time: string;
  status: SlotStatus;
  name?: string;
  phone?: string;
  location?: string;
  notes?: string;
}

interface CalendarDate {
  id: string;
  dateStr: string;
  dayStr: string;
  state: DateState;
  stateLabel: string;
  slots: Slot[];
}

const generateMockCalendar = (): CalendarDate[] => {
  const dates: CalendarDate[] = [];
  const today = new Date();
  
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    
    // Randomize states for mock UI
    let state: DateState = 'available';
    let stateLabel = 'Available';
    let slots: Slot[] = [
      { id: `s1-${i}`, time: '6 PM - 7 PM', status: 'available' },
      { id: `s2-${i}`, time: '7 PM - 8 PM', status: 'available' },
      { id: `s3-${i}`, time: '8 PM - 9 PM', status: 'available' },
      { id: `s4-${i}`, time: '9 PM - 10 PM', status: 'available' }
    ];

    if (i === 0) { // Today
      state = 'partial';
      stateLabel = '2/4 Booked';
      slots[0] = { id: `s1-${i}`, time: '6 PM - 7 PM', status: 'booked', name: 'Bhargav', phone: '+919876543210', location: 'Library', notes: 'Need sunset portraits' };
      slots[1] = { id: `s2-${i}`, time: '7 PM - 8 PM', status: 'booked', name: 'Harsha', phone: '+919876543211', location: 'Main Block' };
      slots[3] = { id: `s4-${i}`, time: '9 PM - 10 PM', status: 'blocked' };
    } else if (i === 2 || i === 7) {
      state = 'full';
      stateLabel = 'FULL';
      slots.forEach(s => { s.status = 'booked'; s.name = 'Client'; });
    } else if (i === 4) {
      state = 'blocked';
      stateLabel = 'BLOCKED';
      slots.forEach(s => s.status = 'blocked');
    } else if (i % 3 === 0) {
      state = 'partial';
      stateLabel = '1/4 Booked';
      slots[2] = { id: `s3-${i}`, time: '8 PM - 9 PM', status: 'booked', name: 'Rahul', phone: '+919876543212', location: 'Garden' };
    }

    // Calculate booking counts
    const totalSlots = slots.length;
    const bookedCount = slots.filter(s => s.status === 'booked').length;
    
    if (state !== 'blocked' && state !== 'full') {
      stateLabel = `${bookedCount}/${totalSlots} Booked`;
    }

    dates.push({
      id: `date-${i}`,
      dateStr: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      dayStr: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      state,
      stateLabel,
      slots
    });
  }
  return dates;
};

const mockData = generateMockCalendar();

const AdminCalendar: React.FC = () => {
  const navigate = useNavigate();
  const [expandedDateId, setExpandedDateId] = useState<string | null>(mockData[0].id);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleDate = (id: string) => {
    setExpandedDateId(expandedDateId === id ? null : id);
  };

  const closeBottomSheet = () => {
    setSelectedSlot(null);
  };

  const getStateColor = (state: DateState) => {
    switch(state) {
      case 'available': return 'state-gray';
      case 'partial': return 'state-orange';
      case 'full': return 'state-red';
      case 'blocked': return 'state-dark-red';
      default: return 'state-gray';
    }
  };

  return (
    <div className="admin-layout">
      {/* Mobile Bottom Nav */}
      <nav className="admin-bottom-nav mobile-only">
        <Link to="/admin" className="nav-item">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>
        <div className="nav-item active">
          <CalendarIcon size={20} />
          <span>Calendar</span>
        </div>
      </nav>

      <div className="admin-container" style={{ paddingBottom: '120px' }}>
        
        <header className="admin-header calendar-header">
          <div className="month-nav">
            <button className="month-btn">&lt;</button>
            <h1 className="greeting-text" style={{ fontSize: '1.4rem', margin: 0 }}>June 2026</h1>
            <button className="month-btn">&gt;</button>
          </div>
        </header>

        {/* Date Cards List */}
        <div className="calendar-list">
          {mockData.map((date) => {
            const isExpanded = expandedDateId === date.id;
            return (
              <div key={date.id} className={`calendar-card-wrapper ${isExpanded ? 'expanded' : ''}`}>
                <div 
                  className={`calendar-date-card ${getStateColor(date.state)}`}
                  onClick={() => toggleDate(date.id)}
                >
                  <div className="date-info">
                    <span className="cal-date">{date.dateStr}</span>
                    <span className="cal-day">{date.dayStr}</span>
                  </div>
                  <div className="date-status">
                    <span className="status-label">{date.stateLabel}</span>
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      className="slots-accordion"
                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                      animate={{ height: 'auto', opacity: 1, marginTop: 8 }}
                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="slots-accordion-inner">
                        {date.slots.map((slot) => (
                          <div 
                            key={slot.id} 
                            className={`accordion-slot ${slot.status}`}
                            onClick={() => setSelectedSlot(slot)}
                          >
                            <div className="slot-time-block">
                              <span className="time">{slot.time.split(' - ')[0]}</span>
                            </div>
                            <div className="slot-info-block">
                              <span className={`slot-name ${slot.status === 'booked' ? 'booked-name' : ''}`}>
                                {slot.status === 'available' ? 'Available' : slot.status === 'blocked' ? 'Blocked' : slot.name}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            className="admin-toast"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <CheckCircle2 size={20} className="toast-icon" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- SLOT MANAGEMENT BOTTOM SHEET --- */}
      <AnimatePresence>
        {selectedSlot && (
          <>
            <motion.div 
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeBottomSheet}
              style={{ zIndex: 100 }}
            />
            
            <motion.div 
              className="admin-bottom-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="modal-drag-handle" />
              
              <div className="sheet-header">
                <div className="sheet-title-group">
                  <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-secondary)', marginBottom: '4px', fontFamily: 'var(--font-body)' }}>
                    {mockData.find(d => d.slots.some(s => s.id === selectedSlot.id))?.dateStr}
                  </p>
                  <h3>{selectedSlot.time}</h3>
                  <span className={`sheet-badge badge-${selectedSlot.status}`}>
                    STATUS: {selectedSlot.status.toUpperCase()}
                  </span>
                </div>
                <button className="modal-close" onClick={closeBottomSheet}>
                  <X size={24} />
                </button>
              </div>

              <div className="sheet-body">
                {selectedSlot.status === 'booked' && (
                  <div className="booked-details">
                    <div className="detail-row"><span className="label">Name</span><span className="value">{selectedSlot.name}</span></div>
                    <div className="detail-row"><span className="label">Phone</span><a href={`tel:${selectedSlot.phone}`} className="value phone-link">{selectedSlot.phone}</a></div>
                    <div className="detail-row"><span className="label">Location</span><span className="value">{selectedSlot.location || 'N/A'}</span></div>
                    {selectedSlot.notes && (
                      <div className="detail-row vertical">
                        <span className="label">Notes</span>
                        <div className="notes-box">{selectedSlot.notes}</div>
                      </div>
                    )}

                    <div className="sheet-actions mt-4">
                      <a href={`https://wa.me/${selectedSlot.phone?.replace('+', '')}`} target="_blank" rel="noreferrer" className="sheet-btn btn-whatsapp">
                        <MessageCircle size={18} /> WhatsApp Customer
                      </a>
                      <a href={`tel:${selectedSlot.phone}`} className="sheet-btn btn-call">
                        <Phone size={18} /> Call Customer
                      </a>
                      <button className="sheet-btn btn-cancel-booking" onClick={() => {
                        showToast('Booking Cancelled');
                        closeBottomSheet();
                      }}>
                        <Trash2 size={18} /> Cancel Booking
                      </button>
                    </div>
                  </div>
                )}

                {selectedSlot.status === 'available' && (
                  <div className="available-actions">
                    <p className="helper-text">This slot is open for booking.</p>
                    <div className="sheet-actions">
                      <button className="sheet-btn btn-block" onClick={() => {
                        showToast('Slot Blocked Successfully');
                        closeBottomSheet();
                      }}>
                        <Ban size={18} /> Block Slot
                      </button>
                      <button className="sheet-btn btn-manual" onClick={() => {
                        showToast('Manual Booking Created');
                        closeBottomSheet();
                      }}>
                        <PlusCircle size={18} /> Add Manual Booking
                      </button>
                    </div>
                  </div>
                )}

                {selectedSlot.status === 'blocked' && (
                  <div className="blocked-actions">
                    <p className="helper-text">This slot is manually blocked and not visible to users.</p>
                    <div className="sheet-actions">
                      <button className="sheet-btn btn-unblock" onClick={() => {
                        showToast('Slot Unblocked');
                        closeBottomSheet();
                      }}>
                        <Unlock size={18} /> Unblock Slot
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminCalendar;
