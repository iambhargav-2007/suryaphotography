import React from 'react';
import { motion, useScroll, useTransform, type Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

import heroImg from '../assets/hero.jpeg';

const Hero: React.FC = () => {
  const { scrollY } = useScroll();
  const navigate = useNavigate();
  
  // Parallax movements
  const imageY = useTransform(scrollY, [0, 1000], [0, 150]);
  const textY = useTransform(scrollY, [0, 1000], [0, -80]);
  
  // Stagger variants for the headline
  const containerVars: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.4 }
    }
  };

  const lineVars: Variants = {
    hidden: { opacity: 0, y: 60, rotateX: -15 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section className="hero-section">
      <div className="noise-overlay" />
      {/* Background Subtle Glow */}
      <motion.div 
        className="hero-glow-bg"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Photographer Image with Cinematic Masking */}
      <motion.div 
        className="hero-image-wrapper"
        initial={{ opacity: 0, filter: 'blur(20px)', scale: 1.1 }}
        animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.img 
          src={heroImg} 
          alt="Surya Photography Portrait" 
          className="hero-image" 
          style={{ y: imageY }}
        />
        <div className="hero-image-overlay" />
      </motion.div>

      {/* Editorial Typography & Content */}
      <motion.div className="hero-content" style={{ y: textY }}>
        <motion.div 
          className="hero-supertitle"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease: 'easeOut' }}
        >
          Surya Photography
        </motion.div>

        <motion.div 
          className="hero-headline"
          variants={containerVars}
          initial="hidden"
          animate="visible"
          style={{ perspective: 1000 }}
        >
          <motion.div variants={lineVars}>CAPTURE</motion.div>
          <motion.div variants={lineVars}>YOUR BEST</motion.div>
          <motion.div variants={lineVars} className="text-orange">VERSION</motion.div>
        </motion.div>

        <motion.div 
          className="hero-cta-container"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.button 
            className="btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/booking')}
          >
            Book Now
          </motion.button>
          <motion.button 
            className="btn-secondary-ghost"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Explore Work
          </motion.button>
        </motion.div>
      </motion.div>

    </section>
  );
};

export default Hero;
