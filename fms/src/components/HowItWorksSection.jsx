import React from "react";
import "../styles/HowItWorks.css";

export default function HowItWorksSection() {
  const steps = [
    { n: 1, t: "Sign up", d: "Create your account in minutes." },
    { n: 2, t: "Connect", d: "Add your customers and products." },
    { n: 3, t: "Invoice", d: "Send invoices and track payments." },
    { n: 4, t: "Analyze", d: "See insights and reports instantly." },
  ];

  return (
    <section className="hiw">
      <h2 className="section-title">How It Works</h2>
      <div className="hiw-steps">
        {steps.map(s => (
          <div key={s.n} className="hiw-card">
            <div className="hiw-num">{s.n}</div>
            <div className="hiw-title">{s.t}</div>
            <div className="hiw-desc">{s.d}</div>
          </div>
        ))}
      </div>
    </section>
  );
}


