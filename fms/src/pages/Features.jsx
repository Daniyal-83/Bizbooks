import React from 'react';
import "../styles/Pages.css";
import FeatureList from '../components/FeatureList';
import BenefitBanner from '../components/BenefitBanner';
import TestimonialCard from '../components/TestimonialCard';

export default function Features() {
  return (
    <div className="features-page">
      <BenefitBanner />
      <FeatureList />
      <TestimonialCard />
    </div>
  );
}
