import "../styles/Pricing.css";

export default function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "$9.99/mo",
      features: ["Track expenses", "Send invoices", "Basic reports"],
      button: "Start Free Trial",
    },
    {
      name: "Business",
      price: "$19.99/mo",
      features: [
        "Everything in Starter",
        "Advanced reports",
        "Team collaboration",
      ],
      button: "Start Free Trial",
    },
    {
      name: "Enterprise",
      price: "$39.99/mo",
      features: [
        "Everything in Business",
        "Custom integrations",
        "Priority support",
      ],
      button: "Contact Sales",
    },
  ];

  return (
    <section className="pricing">
      <h2 className="pricing-title">Choose the Plan That Fits You</h2>
      <div className="pricing-grid">
        {plans.map((plan, index) => (
          <div key={index} className="pricing-card">
            <h3>{plan.name}</h3>
            <p className="pricing-price">{plan.price}</p>
            <ul>
              {plan.features.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
            <button className="btn-pricing">{plan.button}</button>
          </div>
        ))}
      </div>
    </section>
  );
}
