import React from 'react';
import Hero from '../../components/home/Hero';
import ProductCapabilities from '../../components/home/ProductCapabilities';
import Features from '../../components/home/Features';
import HowItWorks from '../../components/home/HowItWorks';
import ArchitectureSection from '../../components/home/ArchitectureSection';
import WhyPulseOps from '../../components/home/WhyPulseOps';
import FinalCTA from '../../components/home/FinalCTA';

export default function Home() {
  return (
    <div style={{ width: '100%' }}>
      <Hero />
      <ProductCapabilities />
      <Features />
      <HowItWorks />
      <ArchitectureSection />
      <WhyPulseOps />
      <FinalCTA />
    </div>
  );
}
