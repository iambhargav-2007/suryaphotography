import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import './MyWork.css';

// Import all images explicitly
import indiv1img1 from '../assets/indiv1img1.jpeg';
import indiv1img2 from '../assets/indiv1img2.jpeg';
import indiv1img3 from '../assets/indiv1img3.jpeg';
import indiv1img4 from '../assets/indiv1img4.jpeg';

import indiv2img1 from '../assets/indiv2img1.jpeg';
import indiv2img2 from '../assets/indiv2img2.jpeg';
import indiv2img3 from '../assets/indiv2img3.jpeg';
import indiv2img4 from '../assets/indiv2img4.jpeg';

import indiv3img1 from '../assets/indiv3img1.jpeg';
import indiv3img2 from '../assets/indiv3img2.jpeg';
import indiv3img3 from '../assets/indiv3img3.jpeg';
import indiv3img4 from '../assets/indiv3img4.jpeg';

const collections = [
  { 
    id: 'c1', 
    title: 'Golden Hour Dreams', 
    caption: 'Capturing confidence, elegance and personality through natural light.',
    images: [
      { src: indiv1img1 }, 
      { src: indiv1img2 }, 
      { src: indiv1img3 }, 
      { src: indiv1img4 }
    ] 
  },
  { 
    id: 'c2', 
    title: 'Cinematic Shadows', 
    caption: 'Exploring depth and emotion through intense, dramatic lighting setups.',
    images: [
      { src: indiv2img1 }, 
      { src: indiv2img2 }, 
      { src: indiv2img3 }, 
      { src: indiv2img4 }
    ] 
  },
  { 
    id: 'c3', 
    title: 'Neon Nights', 
    caption: 'A vibrant journey through color, style, and modern editorial aesthetics.',
    images: [
      { src: indiv3img1 }, 
      { src: indiv3img2 }, 
      { src: indiv3img3 }, 
      { src: indiv3img4, position: 'center 10%' }
    ] 
  }
];

// Helper to create the cinematic scale and opacity effect based on scroll position
const FilmImage = ({ image, alt, progress, peak }: { image: { src: string, position?: string }, alt: string, progress: MotionValue<number>, peak: number }) => {
  // Ensure input ranges strictly stay within [0, 1] to prevent WAAPI offset crashes
  const in1 = Math.max(0, peak - 0.25);
  const in3 = Math.min(1, peak + 0.25);

  const scale = useTransform(progress, [in1, peak, in3], [0.90, 1, 0.90]);
  const opacity = useTransform(progress, [in1, peak, in3], [0.4, 1, 0.4]);

  return (
     <motion.div className="film-img-wrapper" style={{ scale, opacity } as any}>
        <img src={image.src} alt={alt} className="film-img" style={image.position ? { objectPosition: image.position } : undefined} />
     </motion.div>
  );
};

const HorizontalStory = ({ story }: { story: typeof collections[0] }) => {
  const targetRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: targetRef,
    // "start start" means progress 0 starts when top of container hits top of viewport
    // "end end" means progress 1 is when bottom of container hits bottom of viewport
    offset: ["start start", "end end"]
  });

  // Calculate the x translation safely using useMotionTemplate to prevent string interpolation errors
  // At progress P, translation is P * -100% and P * 100vw
  const xProgress = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const x = useTransform(xProgress, (val) => `calc(-${val}% + ${val}vw)`);

  // Generic peaks for the 4 images to trigger their cinematic scaling
  // The first image centers around 0.2 scroll progress, the last around 0.95.
  const peaks = [0.2, 0.45, 0.7, 0.95];

  return (
    <div className="horizontal-scroll-container" ref={targetRef}>
      <div className="sticky-viewport">
        <motion.div className="horizontal-film-strip" style={{ x } as any}>
          
          <div className="film-intro">
            <h4 className="film-intro-subtitle">Portrait Story</h4>
            <h3 className="film-intro-title">{story.title}</h3>
            <p className="film-intro-caption">{story.caption}</p>
          </div>

          {story.images.map((img, idx) => (
            <FilmImage 
              key={idx} 
              image={img} 
              alt={`${story.title} - ${idx + 1}`} 
              progress={scrollYProgress} 
              peak={peaks[idx]} 
            />
          ))}

        </motion.div>
      </div>
    </div>
  );
};

const MyWork: React.FC = () => {
  return (
    <section className="my-work-section" id="my-work">
      
      <div className="my-work-header">
        <motion.div 
          className="my-work-supertitle"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Selected Work
        </motion.div>
        
        <motion.h2 
          className="my-work-headline"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Portrait Stories
        </motion.h2>
        
        <motion.p 
          className="my-work-subheading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          A collection of portraits captured through creativity, emotion and light.
        </motion.p>
      </div>

      <div className="horizontal-stories-wrapper">
        {collections.map((story) => (
          <HorizontalStory key={story.id} story={story} />
        ))}
      </div>

    </section>
  );
};

export default MyWork;
