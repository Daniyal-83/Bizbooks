import React from "react";
import "../styles/FAQSection.css";

const faqs = [
  {
    q: "Can I try before I buy?",
    a: "Yes! Our Starter plan is free to use with no credit card required."
  },
  {
    q: "Can I upgrade or downgrade my plan?",
    a: "Absolutely. You can change your plan at any time from your account settings."
  },
  {
    q: "Is my data secure?",
    a: "We use industry-standard encryption and security practices to keep your data safe."
  },
  {
    q: "Do you offer support?",
    a: "Yes, all plans include email support. Business and Enterprise plans include priority support."
  }
];

export default function FAQSection() {
  return (
    <div className="faq-section">
      <h2>Frequently Asked Questions</h2>
      {faqs.map((item, i) => (
        <div key={i} className="faq-item">
          <div className="faq-question">{item.q}</div>
          <div className="faq-answer">{item.a}</div>
        </div>
      ))}
    </div>
  );
}
