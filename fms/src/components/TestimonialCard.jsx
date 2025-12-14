import React from "react";
import "../styles/TestimonialCard.css";

export default function TestimonialCard() {
  return (
    <div className="testimonial-card">
      <p>
        “This invoicing app made my freelance business so much easier. I can
        track payments and send invoices in seconds!”
      </p>
      <div className="testimonial-author">
        — Sarah K., Freelancer
      </div>
    </div>
  );
}
