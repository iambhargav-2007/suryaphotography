import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import './Navbar.css';

import logo from '../assets/logo.png';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogoDoubleClick = () => {
    navigate('/admin/login');
  };

  return (
    <motion.nav 
      className="navbar"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div 
        className="navbar-left"
        onDoubleClick={handleLogoDoubleClick}
        style={{ cursor: 'default', userSelect: 'none' }}
      >
        <img src={logo} alt="Surya Photography" className="navbar-logo" />
        <span className="navbar-brand">Surya <span className="brand-text-full">Photography</span></span>
      </div>

      <div className="navbar-center">
        <div className="nav-links">
          <a href="#work" className="nav-link">My Work</a>
          <a href="#contact" className="nav-link">Contact</a>
        </div>
      </div>

      <div className="navbar-right">
        <Link to="/booking" style={{ textDecoration: 'none' }}>
          <motion.button 
            className="btn-book"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Book Now
          </motion.button>
        </Link>
        <button 
          className="hamburger"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <a href="#work" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>My Work</a>
            <a href="#contact" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Contact</a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
