import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Users, XCircle, LayoutDashboard, Settings, LogOut, CheckCircle2, MessageCircle, Phone, Trash2, X, Plus } from 'lucide-react';
import './Admin.css';

import { API_BASE_URL } from '../../config/api';

interface DashboardData {
  todaySessions: number;
  availableSlots: number;
  upcomingSessions: number;
  todayRevenue: number;
  todaySchedule: any[];
  upcomingBookings: any[];
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          navigate('/admin/login');
          return;
        }
        
        const res = await fetch(`${API_BASE_URL}/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) {
          if (res.status === 401) navigate('/admin/login');
          throw new Error('Failed to fetch dashboard');
        }
        
        const data = await res.json();
        setDashboardData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboard();
  }, [navigate]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const closeBottomSheet = () => {
    setSelectedSlot(null);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'booked': return 'status-green';
      case 'available': return 'status-gray';
      case 'blocked': return 'status-red';
      default: return 'status-gray';
    }
  };

  return (
    <div className="admin-layout">
      {/* Mobile Bottom Nav (Mock for MVP, just visual) */}
      <nav className="admin-bottom-nav mobile-only">
        <div className="nav-item active">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </div>
        <Link to="/admin/calendar" className="nav-item">
          <Calendar size={20} />
          <span>Calendar</span>
        </Link>
      </nav>

      <div className="admin-container">
        
        {/* 1. Greeting Section */}
        <motion.header 
          className="admin-header"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="header-flex">
            <div>
              <h1 className="greeting-text">Good Evening, Surya 👋</h1>
              <p className="greeting-subtext">{dashboardData?.todaySessions || 0} portrait session{(dashboardData?.todaySessions || 0) === 1 ? '' : 's'} scheduled today.</p>
            </div>
            <button 
              className="logout-btn desktop-only" 
              onClick={() => {
                localStorage.removeItem('adminToken');
                navigate('/admin/login');
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </motion.header>

        {/* 2. Stats Cards */}
        <motion.section 
          className="stats-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="stat-card">
            <span className="stat-value">{dashboardData?.todaySessions || 0}</span>
            <span className="stat-label">Today's<br/>Sessions</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{dashboardData?.availableSlots || 0}</span>
            <span className="stat-label">Available<br/>Slots</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">₹{dashboardData?.todayRevenue || 0}</span>
            <span className="stat-label">Today's<br/>Revenue</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{dashboardData?.upcomingSessions || 0}</span>
            <span className="stat-label">Upcoming<br/>Sessions</span>
          </div>
        </motion.section>

        {/* 3. Today's Schedule (Most Important) */}
        <motion.section 
          className="schedule-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="section-title">Today's Schedule</h2>
          <div className="schedule-card">
            <div className="schedule-header-badge">TODAY</div>
            <div className="schedule-list">
              {loading ? <p style={{padding: '1rem'}}>Loading schedule...</p> : dashboardData?.todaySchedule?.map((slot) => (
                <div 
                  key={slot.id} 
                  className="schedule-item" 
                  onClick={() => slot.status === 'booked' ? setSelectedSlot(slot) : null}
                  style={{ cursor: slot.status === 'booked' ? 'pointer' : 'default' }}
                >
                  <div className="schedule-time">{slot.time}</div>
                  <div className="schedule-details">
                    <div className={`status-dot ${getStatusColor(slot.status)}`} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="schedule-name">{slot.name}</span>
                      {slot.phone && (
                        <a 
                          href={`tel:${slot.phone}`} 
                          style={{ 
                            fontFamily: 'var(--font-body)', 
                            fontSize: '0.8rem', 
                            color: 'var(--admin-accent)', 
                            textDecoration: 'none',
                            marginTop: '2px'
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {slot.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 4. Quick Actions */}
        <motion.section 
          className="actions-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="section-title">Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-btn" onClick={() => navigate('/admin/calendar')}>
              <Calendar size={20} />
              View Calendar
            </button>
          </div>
        </motion.section>

        {/* 5. Upcoming Sessions */}
        <motion.section 
          className="upcoming-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="section-title">Upcoming Sessions</h2>
          <div className="upcoming-list">
            {loading ? <p style={{padding: '1rem'}}>Loading upcoming...</p> : dashboardData?.upcomingBookings?.map((session, index) => (
              <React.Fragment key={session.id}>
                <div className="upcoming-item">
                  <div className="upcoming-date">{session.date}</div>
                  <div className="upcoming-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="upcoming-time">{session.time}</span>
                      <span className="upcoming-divider">-</span>
                      <span className="upcoming-name">{session.name}</span>
                    </div>
                    {session.phone && (
                      <a 
                        href={`tel:${session.phone}`} 
                        style={{ 
                          fontFamily: 'var(--font-body)', 
                          fontSize: '0.75rem', 
                          color: 'var(--admin-accent)', 
                          textDecoration: 'none',
                          marginTop: '2px'
                        }}
                      >
                        {session.phone}
                      </a>
                    )}
                  </div>
                </div>
                {index < dashboardData.upcomingBookings.length - 1 && <div className="upcoming-separator" />}
              </React.Fragment>
            ))}
            {dashboardData?.upcomingBookings?.length === 0 && <p style={{padding: '1rem', color: 'var(--admin-text-secondary)'}}>No upcoming sessions.</p>}
          </div>
        </motion.section>

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

      {/* SLOT MANAGEMENT BOTTOM SHEET */}
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
                  <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-secondary)', marginBottom: '4px', fontFamily: 'var(--font-body)' }}>Today</p>
                  <h3>{selectedSlot.time}</h3>
                  <span className="sheet-badge badge-booked">
                    BOOKED
                  </span>
                </div>
                <button className="modal-close" onClick={closeBottomSheet}>
                  <X size={24} />
                </button>
              </div>

              <div className="sheet-body">
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
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
