import "../styles/Features.css";
import { motion } from "framer-motion";

export default function FeaturesSection() {
  const features = [
    {
      title: "Expense Tracking",
      description: "Easily record and categorize your business expenses in real-time.",
      icon: "💰",
    },
    {
      title: "Invoicing",
      description: "Create and send professional invoices with automated reminders.",
      icon: "📄",
    },
    {
      title: "Reports & Insights",
      description: "Get detailed financial reports to make smarter business decisions.",
      icon: "📊",
    },
    {
      title: "Secure Cloud",
      description: "Your data is safe and accessible anywhere, anytime.",
      icon: "☁️",
    },
  ];

  return (
    <section className="features">
      <motion.h2
        className="features-title"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        Why Choose BizBooks?
      </motion.h2>
      <div className="features-grid">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="feature-card"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            viewport={{ once: true }}
          >
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
