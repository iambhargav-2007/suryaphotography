import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import MyWork from '../components/MyWork';
import Footer from '../components/Footer';

const Home: React.FC = () => {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <MyWork />
      </main>
      <Footer />
    </>
  );
};

export default Home;
