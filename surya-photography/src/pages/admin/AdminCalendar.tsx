import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Users, Settings, LayoutDashboard, X, ChevronRight, ChevronDown, MessageCircle, Phone, Trash2, PlusCircle, Ban, Unlock, CheckCircle2, Plus, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';
import './Admin.css';

// --- Types ---
type SlotStatus = 'available' | 'booked' | 'blocked';
type DateState = 'available' | 'partial' | 'full' | 'blocked';

interface Slot {
  id: string;
  time: string;
  status: SlotStatus;
  bookingId?: string;
  name?: string;
  email?: string;
  phone?: string;
  year?: string;
  branch?: string;
  location?: string;
  notes?: string;
}

interface CalendarDate {
  id: string;
  dateStr: string;
  dayStr: string;
  state: DateState;
  stateLabel: string;
}

const AdminCalendar: React.FC = () => {
  const navigate = useNavigate();
  const [datesList, setDatesList] = useState<CalendarDate[]>([]);
  const [slotsByDate, setSlotsByDate] = useState<Record<string, Slot[]>>({});
  
  const [expandedDateId, setExpandedDateId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState<Record<string, boolean>>({});

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchCalendar = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return navigate('/admin/login');
      
      const res = await fetch(`${API_BASE_URL}/admin/calendar`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch calendar');
      const data = await res.json();
      
      const todayStr = new Date().toISOString().split('T')[0];
      
      const formattedDates = data.map((item: any) => {
        const d = new Date(item.date);
        
        let dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        if (item.date === todayStr) dayName = 'Today';
        
        let state: DateState = 'available';
        let stateLabel = 'Available';
        const totalSlots = 4;
        
        if (item.blocked === 4) {
          state = 'blocked';
          stateLabel = 'BLOCKED';
        } else if (item.booked >= totalSlots) {
          state = 'full';
          stateLabel = 'FULL';
        } else if (item.booked > 0) {
          state = 'partial';
          stateLabel = `${item.booked}/${totalSlots} Booked`;
        }
        
        return {
          id: item.date,
          dateStr: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
          dayStr: dayName,
          state,
          stateLabel
        };
      });
      
      setDatesList(formattedDates);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, [navigate]);

  const fetchSlotsForDate = async (dateId: string) => {
    setSlotsLoading(prev => ({ ...prev, [dateId]: true }));
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/admin/calendar/${dateId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch slots');
      const data = await res.json();
      
      const mappedSlots = data.slots.map((s: any) => {
        let timeLabel = s.slot;
        if (s.slot === '6PM') timeLabel = '6 PM - 7 PM';
        if (s.slot === '7PM') timeLabel = '7 PM - 8 PM';
        if (s.slot === '8PM') timeLabel = '8 PM - 9 PM';
        if (s.slot === '9PM') timeLabel = '9 PM - 10 PM';
        
        return {
          id: s.slot,
          time: timeLabel,
          status: s.status.toLowerCase(),
          bookingId: s.bookingId,
          name: s.name,
          email: s.email,
          phone: s.phone,
          year: s.year,
          branch: s.branch,
          location: s.location,
          notes: s.notes || s.reason
        };
      });
      
      setSlotsByDate(prev => ({ ...prev, [dateId]: mappedSlots }));
    } catch (err) {
      console.error(err);
    } finally {
      setSlotsLoading(prev => ({ ...prev, [dateId]: false }));
    }
  };

  const toggleDate = (id: string) => {
    if (expandedDateId === id) {
      setExpandedDateId(null);
    } else {
      setExpandedDateId(id);
      if (!slotsByDate[id]) {
        fetchSlotsForDate(id);
      }
    }
  };

  const closeBottomSheet = () => {
    setSelectedSlot(null);
    setSelectedDate(null);
  };

  const handleBlockSlot = async () => {
    if (!selectedSlot || !selectedDate) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/admin/block-slot`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ date: selectedDate, slot: selectedSlot.id, reason: 'Manual Block' })
      });
      if (res.ok) {
        showToast('Slot Blocked Successfully');
        fetchSlotsForDate(selectedDate);
        fetchCalendar();
        closeBottomSheet();
      } else {
        const err = await res.json();
        showToast(`Error: ${err.message}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnblockSlot = async () => {
    if (!selectedSlot || !selectedDate) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/admin/unblock-slot`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ date: selectedDate, slot: selectedSlot.id })
      });
      if (res.ok) {
        showToast('Slot Unblocked');
        fetchSlotsForDate(selectedDate);
        fetchCalendar();
        closeBottomSheet();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedSlot || !selectedDate || !selectedSlot.bookingId) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/admin/bookings/${selectedSlot.bookingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Booking Cancelled / Rejected');
        fetchSlotsForDate(selectedDate);
        fetchCalendar();
        closeBottomSheet();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptBooking = async () => {
    if (!selectedSlot || !selectedDate || !selectedSlot.bookingId) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/admin/bookings/${selectedSlot.bookingId}/accept`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Booking Accepted');
        fetchSlotsForDate(selectedDate);
        fetchCalendar();
        closeBottomSheet();
      }
    } catch (err) {
      console.error(err);
    }
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
        
        <header className="admin-header calendar-header" style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          <button 
            onClick={() => navigate('/admin')}
            style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--admin-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem', fontFamily: 'var(--font-body)' }}
            className="back-btn"
          >
            <ArrowLeft size={20} />
            <span className="desktop-only">Back</span>
          </button>
          <div className="month-nav">
            <button className="month-btn">&lt;</button>
            <h1 className="greeting-text" style={{ fontSize: '1.4rem', margin: 0 }}>Calendar</h1>
            <button className="month-btn">&gt;</button>
          </div>
        </header>

        {/* Date Cards List */}
        <div className="calendar-list">
          {loading ? <p>Loading calendar...</p> : datesList.map((date) => {
            const isExpanded = expandedDateId === date.id;
            const slots = slotsByDate[date.id] || [];
            const isLoadingSlots = slotsLoading[date.id];

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
                        {isLoadingSlots ? (
                          <p style={{padding: '0.5rem 1rem'}}>Loading slots...</p>
                        ) : slots.map((slot) => (
                          <div 
                            key={slot.id} 
                            className={`accordion-slot ${slot.status}`}
                            onClick={() => {
                              setSelectedSlot(slot);
                              setSelectedDate(date.id);
                            }}
                          >
                            <div className="slot-time-block">
                              <span className="time">{slot.time.split(' - ')[0]}</span>
                            </div>
                            <div className="slot-info-block">
                              <span className={`slot-name ${slot.status === 'booked' || slot.status === 'pending' ? 'booked-name' : ''}`}>
                                {slot.status === 'available' ? 'Available' : slot.status === 'blocked' ? 'Blocked' : slot.name + (slot.status === 'pending' ? ' (Pending)' : '')}
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
                    {datesList.find(d => d.id === selectedDate)?.dateStr}
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
                {(selectedSlot.status === 'booked' || selectedSlot.status === 'pending') && (
                  <div className="booked-details">
                    <div className="detail-row"><span className="label">Name</span><span className="value">{selectedSlot.name}</span></div>
                    <div className="detail-row"><span className="label">Email</span><span className="value">{selectedSlot.email || 'N/A'}</span></div>
                    <div className="detail-row"><span className="label">Phone</span><a href={`tel:${selectedSlot.phone}`} className="value phone-link">{selectedSlot.phone}</a></div>
                    <div className="detail-row"><span className="label">Year</span><span className="value">{selectedSlot.year || 'N/A'}</span></div>
                    <div className="detail-row"><span className="label">Branch</span><span className="value">{selectedSlot.branch || 'N/A'}</span></div>
                    <div className="detail-row"><span className="label">Location</span><span className="value">{selectedSlot.location || 'N/A'}</span></div>
                    {selectedSlot.notes && (
                      <div className="detail-row vertical">
                        <span className="label">Notes</span>
                        <div className="notes-box">{selectedSlot.notes}</div>
                      </div>
                    )}
                    
                    <div className="sheet-actions mt-4">
                      <button className="sheet-btn" style={{backgroundColor: 'var(--status-green)', color: '#fff', borderColor: 'var(--status-green)'}} onClick={handleAcceptBooking}>
                        <CheckCircle2 size={18} /> Accept Booking
                      </button>
                      <a href={`https://wa.me/${selectedSlot.phone?.replace('+', '')}`} target="_blank" rel="noreferrer" className="sheet-btn btn-whatsapp">
                        <MessageCircle size={18} /> WhatsApp Customer
                      </a>
                      <a href={`tel:${selectedSlot.phone}`} className="sheet-btn btn-call">
                        <Phone size={18} /> Call Customer
                      </a>
                      <button className="sheet-btn btn-cancel-booking" onClick={handleCancelBooking}>
                        <Trash2 size={18} /> Reject / Cancel Booking
                      </button>
                    </div>
                  </div>
                )}

                {selectedSlot.status === 'available' && (
                  <div className="available-actions">
                    <p className="helper-text">This slot is open for booking.</p>
                    <div className="sheet-actions">
                      <button className="sheet-btn btn-block" onClick={handleBlockSlot}>
                        <Ban size={18} /> Block Slot
                      </button>
                    </div>
                  </div>
                )}

                {selectedSlot.status === 'blocked' && (
                  <div className="blocked-actions">
                    <p className="helper-text">This slot is manually blocked and not visible to users.</p>
                    <div className="sheet-actions">
                      <button className="sheet-btn btn-unblock" onClick={handleUnblockSlot}>
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
