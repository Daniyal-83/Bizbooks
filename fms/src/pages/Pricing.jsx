import React from 'react';
import "../styles/Pages.css";
import PricingSection from '../components/PricingSection';
import ComparisonTable from '../components/ComparisonTable';
import FAQSection from '../components/FAQSection';

export default function Pricing() {
  return (
    <div className="pricing-page">
      <PricingSection />
      <ComparisonTable />
      <FAQSection />
    </div>
  );
}
