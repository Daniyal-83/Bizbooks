import React from "react";
import "../styles/FeatureList.css";

const features = [
  { title: "Fast Invoicing", desc: "Create and send invoices in seconds." },
  { title: "Customer Management", desc: "Easily manage all your customers." },
  { title: "Analytics Dashboard", desc: "Track payments and business growth." },
  { title: "Secure Payments", desc: "Accept payments securely online." },
];

export default function FeatureList() {
  return (
    <section className="feature-list">
      <h2>Key Features</h2>
      <div className="feature-list-cards">
        {features.map((f, i) => (
          <div key={i} className="feature-list-card">
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
