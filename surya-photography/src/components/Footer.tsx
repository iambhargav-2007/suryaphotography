import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const lastClickRef = useRef(0);

  const handleFooterClick = () => {
    const now = Date.now();
    if (now - lastClickRef.current < 300) {
      navigate('/admin/login');
    }
    lastClickRef.current = now;
  };

  return (
    <section className="footer-section" id="contact">
      
      {/* Subtle Radial Glow behind the CTA */}
      <motion.div 
        className="footer-radial-glow"
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.5, 0.7, 0.5]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="footer-content">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="footer-text-group"
        >
          <h2 className="footer-headline">
            Let's Create Something Worth Remembering.
          </h2>
          <p className="footer-subheading">
            Book your portrait session today.
          </p>
        </motion.div>

        <motion.div 
          className="footer-cta"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <Link to="/booking" className="btn-book-now">
            Book Now
          </Link>
        </motion.div>

        <motion.div 
          className="footer-contact-grid"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="contact-item">
            <span className="contact-label">Instagram</span>
            <a href="https://instagram.com/surya_photogrf" target="_blank" rel="noreferrer" className="contact-link">
              @surya_photogrf
            </a>
          </div>
          
          <div className="contact-separator" />
          
          <div className="contact-item">
            <span className="contact-label">Call</span>
            <a href="tel:7288042685" className="contact-link">
              7288042685
            </a>
          </div>
        </motion.div>
      </div>

      <div className="footer-bottom">
        <span 
          onClick={handleFooterClick} 
          style={{ cursor: 'default', userSelect: 'none' }}
        >
          © 2026 Surya Photography
        </span>
      </div>
    </section>
  );
};

export default Footer;
