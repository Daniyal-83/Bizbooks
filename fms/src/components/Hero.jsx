import "../styles/Hero.css";
import heroImg from "../assets/hero.png";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <motion.section
      className="hero"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
    >
      <div className="hero-content">
        <h1>Smart Financial Management for Your Business</h1>
        <p>
          Track expenses, manage invoices, and grow with BizBooks — your all-in-one
          business finance solution.
        </p>
        <div className="hero-buttons">
          <button className="btn-primary">Start Free Trial</button>
          <button className="btn-secondary">Learn More</button>
        </div>
      </div>

      <div className="hero-image">
        <img src={heroImg} alt="Dashboard Preview" />
      </div>
    </motion.section>
  );
}
