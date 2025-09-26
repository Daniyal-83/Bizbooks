import React from "react";
import { FaApple, FaGoogle, FaAmazon, FaMicrosoft, FaPaypal } from "react-icons/fa";
import "../styles/Partners.css";

export default function PartnersSection() {
  const logos = [
    { key: "apple", Icon: FaApple },
    { key: "google", Icon: FaGoogle },
    { key: "amazon", Icon: FaAmazon },
    { key: "microsoft", Icon: FaMicrosoft },
    { key: "paypal", Icon: FaPaypal },
  ];

  return (
    <section className="partners">
      <h2 className="section-title">Trusted by Partners & Sponsors</h2>
      <div className="partners-row">
        {logos.map(({ key, Icon }) => (
          <div className="partner-badge" key={key}>
            <Icon size={36} color="#2c2c2c" />
          </div>
        ))}
      </div>
    </section>
  );
}


