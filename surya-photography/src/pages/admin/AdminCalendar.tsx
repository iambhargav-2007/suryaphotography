import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon, LayoutDashboard, X, ChevronRight,
  ChevronDown, MessageCircle, Phone, Trash2, Ban, Unlock,
  CheckCircle2, ArrowLeft, Loader2
} from 'lucide-react';
import { API_BASE_URL } from '../../config/api';
import './Admin.css';

type SlotStatus = 'available' | 'booked' | 'blocked' | 'pending';
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
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState<Record<string, boolean>>({});
  const [actionLoading, setActionLoading] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getToken = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) navigate('/admin/login');
    return token;
  };

  const fetchCalendar = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/admin/calendar`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) return navigate('/admin/login');
      if (!res.ok) throw new Error('Failed to fetch calendar');
      const data = await res.json();

      const todayStr = new Date().toISOString().split('T')[0];
      const formattedDates = data.map((item: any) => {
        const d = new Date(item.date + 'T00:00:00');
        let dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        if (item.date === todayStr) dayName = 'Today';
        let state: DateState = 'available';
        let stateLabel = 'Available';
        if (item.blocked >= 4) { state = 'blocked'; stateLabel = 'BLOCKED'; }
        else if (item.booked >= 4) { state = 'full'; stateLabel = 'FULL'; }
        else if (item.booked > 0) { state = 'partial'; stateLabel = `${item.booked}/4 Booked`; }
        return {
          id: item.date,
          dateStr: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
          dayStr: dayName, state, stateLabel
        };
      });
      setDatesList(formattedDates);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCalendar(); }, []);

  const fetchSlotsForDate = async (dateId: string) => {
    setSlotsLoading(prev => ({ ...prev, [dateId]: true }));
    try {
      const token = getToken();
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/admin/calendar/${dateId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch slots');
      const data = await res.json();
      const slotTimeMap: Record<string, string> = {
        '6PM': '6 PM – 7 PM', '7PM': '7 PM – 8 PM',
        '8PM': '8 PM – 9 PM', '9PM': '9 PM – 10 PM'
      };
      const mappedSlots: Slot[] = data.slots.map((s: any) => ({
        id: s.slot,
        time: slotTimeMap[s.slot] || s.slot,
        status: (s.status || 'available').toLowerCase() as SlotStatus,
        bookingId: s.bookingId,
        name: s.name,
        email: s.email,
        phone: s.phone,
        year: s.year,
        branch: s.branch,
        location: s.location,
        notes: s.notes || s.reason
      }));
      setSlotsByDate(prev => ({ ...prev, [dateId]: mappedSlots }));
    } catch (err) {
      console.error(err);
    } finally {
      setSlotsLoading(prev => ({ ...prev, [dateId]: false }));
    }
  };

  const toggleDate = (id: string) => {
    if (expandedDateId === id) { setExpandedDateId(null); }
    else { setExpandedDateId(id); if (!slotsByDate[id]) fetchSlotsForDate(id); }
  };

  const closeSheet = () => { setSelectedSlot(null); setSelectedDate(null); };

  const handleAcceptBooking = async () => {
    if (!selectedSlot?.bookingId || !selectedDate || actionLoading) return;
    setActionLoading(true);
    try {
      const token = getToken();
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/admin/bookings/${selectedSlot.bookingId}/accept`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Booking accepted! Confirmation email sent to customer.');
        closeSheet();
        fetchSlotsForDate(selectedDate);
        fetchCalendar();
      } else {
        showToast(data.message || 'Could not accept booking', 'error');
      }
    } catch {
      showToast('Network error. Please try again.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectBooking = async () => {
    if (!selectedSlot?.bookingId || !selectedDate || actionLoading) return;
    setActionLoading(true);
    try {
      const token = getToken();
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/admin/bookings/${selectedSlot.bookingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Booking rejected. User has been notified via email.');
        closeSheet();
        fetchSlotsForDate(selectedDate);
        fetchCalendar();
      } else {
        showToast(data.message || 'Could not reject booking', 'error');
      }
    } catch {
      showToast('Network error. Please try again.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlockSlot = async () => {
    if (!selectedSlot || !selectedDate || actionLoading) return;
    setActionLoading(true);
    try {
      const token = getToken();
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/admin/block-slot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ date: selectedDate, slot: selectedSlot.id, reason: 'Manual Block' })
      });
      const data = await res.json();
      if (res.ok) { showToast('Slot blocked successfully.'); closeSheet(); fetchSlotsForDate(selectedDate); fetchCalendar(); }
      else showToast(data.message || 'Could not block slot', 'error');
    } catch { console.error('block error'); }
    finally { setActionLoading(false); }
  };

  const handleUnblockSlot = async () => {
    if (!selectedSlot || !selectedDate || actionLoading) return;
    setActionLoading(true);
    try {
      const token = getToken();
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/admin/unblock-slot`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ date: selectedDate, slot: selectedSlot.id })
      });
      if (res.ok) { showToast('Slot unblocked.'); closeSheet(); fetchSlotsForDate(selectedDate); fetchCalendar(); }
    } catch { console.error('unblock error'); }
    finally { setActionLoading(false); }
  };

  const getStateColor = (state: DateState) => {
    switch (state) {
      case 'available': return 'state-gray';
      case 'partial': return 'state-orange';
      case 'full': return 'state-red';
      case 'blocked': return 'state-dark-red';
      default: return 'state-gray';
    }
  };

  return (
    <div className="admin-layout">
      <nav className="admin-bottom-nav mobile-only">
        <Link to="/admin" className="nav-item"><LayoutDashboard size={20} /><span>Dashboard</span></Link>
        <div className="nav-item active"><CalendarIcon size={20} /><span>Calendar</span></div>
      </nav>

      <div className="admin-container" style={{ paddingBottom: '120px' }}>
        <header className="admin-header calendar-header" style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          <button onClick={() => navigate('/admin')} style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--admin-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem', fontFamily: 'var(--font-body)' }}>
            <ArrowLeft size={20} /><span className="desktop-only">Back</span>
          </button>
          <h1 className="greeting-text" style={{ fontSize: '1.4rem', margin: 0 }}>Calendar</h1>
        </header>

        <div className="calendar-list">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'var(--admin-text-secondary)' }}>Loading calendar...</div>
          ) : datesList.map((date) => {
            const isExpanded = expandedDateId === date.id;
            const slots = slotsByDate[date.id] || [];
            const isLoadingSlots = slotsLoading[date.id];
            return (
              <div key={date.id} className={`calendar-card-wrapper ${isExpanded ? 'expanded' : ''}`}>
                <div className={`calendar-date-card ${getStateColor(date.state)}`} onClick={() => toggleDate(date.id)}>
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
                    <motion.div className="slots-accordion" initial={{ height: 0, opacity: 0, marginTop: 0 }} animate={{ height: 'auto', opacity: 1, marginTop: 8 }} exit={{ height: 0, opacity: 0, marginTop: 0 }} transition={{ duration: 0.25, ease: 'easeOut' }} style={{ overflow: 'hidden' }}>
                      <div className="slots-accordion-inner">
                        {isLoadingSlots ? (
                          <p style={{ padding: '0.75rem 1rem', color: 'var(--admin-text-secondary)', fontFamily: 'var(--font-body)' }}>Loading...</p>
                        ) : slots.map((slot) => (
                          <div key={slot.id} className={`accordion-slot ${slot.status}`} onClick={() => { setSelectedSlot(slot); setSelectedDate(date.id); }}>
                            <div className="slot-time-block"><span className="time">{slot.time.split(' – ')[0]}</span></div>
                            <div className="slot-info-block">
                              <span className={`slot-name ${slot.status === 'booked' || slot.status === 'pending' ? 'booked-name' : ''}`}>
                                {slot.status === 'available' ? 'Available' : slot.status === 'blocked' ? 'Blocked' : slot.status === 'pending' ? `${slot.name} · Pending` : slot.name}
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

      {/* TOAST */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div className="admin-toast" style={{ borderLeftColor: toastType === 'error' ? '#EF4444' : 'var(--admin-accent)' }} initial={{ opacity: 0, y: -20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
            <CheckCircle2 size={20} className="toast-icon" style={{ color: toastType === 'error' ? '#EF4444' : 'var(--admin-accent)' }} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOOKING DETAIL SHEET */}
      <AnimatePresence>
        {selectedSlot && (
          <>
            <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeSheet} style={{ zIndex: 100 }} />
            <motion.div className="admin-bottom-sheet" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}>
              <div className="modal-drag-handle" />

              <div className="sheet-header">
                <div className="sheet-title-group">
                  <p style={{ fontSize: '0.7rem', color: 'var(--admin-text-secondary)', marginBottom: '6px', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                    {datesList.find(d => d.id === selectedDate)?.dateStr}
                  </p>
                  <h3>{selectedSlot.time}</h3>
                  <span className={`sheet-badge badge-${selectedSlot.status}`}>
                    {selectedSlot.status === 'pending' ? 'PENDING APPROVAL'
                      : selectedSlot.status === 'booked' ? 'CONFIRMED'
                      : selectedSlot.status === 'blocked' ? 'BLOCKED' : 'AVAILABLE'}
                  </span>
                </div>
                <button className="modal-close" onClick={closeSheet}><X size={20} /></button>
              </div>

              <div className="sheet-scroll-content">
                <div className="sheet-body">

                  {(selectedSlot.status === 'booked' || selectedSlot.status === 'pending') && (
                    <>
                      <div className="booked-details">
                        <div className="detail-row"><span className="label">Name</span><span className="value">{selectedSlot.name || 'N/A'}</span></div>
                        <div className="detail-row"><span className="label">Email</span><span className="value">{selectedSlot.email || 'N/A'}</span></div>
                        <div className="detail-row"><span className="label">Phone</span><a href={`tel:${selectedSlot.phone}`} className="value phone-link">{selectedSlot.phone || 'N/A'}</a></div>
                        <div className="detail-row"><span className="label">Year</span><span className="value">{selectedSlot.year || 'N/A'}</span></div>
                        <div className="detail-row"><span className="label">Branch</span><span className="value">{selectedSlot.branch || 'N/A'}</span></div>
                        <div className="detail-row"><span className="label">Location</span><span className="value">{selectedSlot.location || 'N/A'}</span></div>
                        {selectedSlot.notes && (
                          <div className="detail-row vertical">
                            <span className="label">Notes</span>
                            <div className="notes-box">{selectedSlot.notes}</div>
                          </div>
                        )}
                      </div>

                      <div className="sheet-actions">
                        {selectedSlot.status === 'pending' && (
                          <button className="sheet-btn btn-accept-booking" onClick={handleAcceptBooking} disabled={actionLoading}>
                            {actionLoading ? <Loader2 size={18} className="spin-icon" /> : <CheckCircle2 size={18} />}
                            {actionLoading ? 'Processing...' : 'Accept Booking'}
                          </button>
                        )}
                        <a href={`https://wa.me/${selectedSlot.phone?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="sheet-btn btn-whatsapp">
                          <MessageCircle size={18} /> WhatsApp Customer
                        </a>
                        <a href={`tel:${selectedSlot.phone}`} className="sheet-btn btn-call">
                          <Phone size={18} /> Call Customer
                        </a>
                        <button className="sheet-btn btn-cancel-booking" onClick={handleRejectBooking} disabled={actionLoading}>
                          {actionLoading ? <Loader2 size={18} className="spin-icon" /> : <Trash2 size={18} />}
                          {actionLoading ? 'Processing...' : selectedSlot.status === 'pending' ? 'Reject Booking' : 'Cancel Booking'}
                        </button>
                      </div>
                    </>
                  )}

                  {selectedSlot.status === 'available' && (
                    <div className="sheet-actions" style={{ paddingTop: '0.5rem' }}>
                      <p className="helper-text">This slot is open. Block it to prevent new bookings.</p>
                      <button className="sheet-btn btn-block" onClick={handleBlockSlot} disabled={actionLoading}>
                        {actionLoading ? <Loader2 size={18} className="spin-icon" /> : <Ban size={18} />}
                        {actionLoading ? 'Blocking...' : 'Block Slot'}
                      </button>
                    </div>
                  )}

                  {selectedSlot.status === 'blocked' && (
                    <div className="sheet-actions" style={{ paddingTop: '0.5rem' }}>
                      <p className="helper-text">This slot is manually blocked and hidden from users.</p>
                      <button className="sheet-btn btn-unblock" onClick={handleUnblockSlot} disabled={actionLoading}>
                        {actionLoading ? <Loader2 size={18} className="spin-icon" /> : <Unlock size={18} />}
                        {actionLoading ? 'Unblocking...' : 'Unblock Slot'}
                      </button>
                    </div>
                  )}

                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCalendar;
