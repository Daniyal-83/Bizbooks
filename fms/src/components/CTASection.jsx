import "../styles/CTA.css";
import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <motion.section
      className="cta"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
    >
      <motion.div
        className="cta-content"
        initial={{ scale: 0.95, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
        >
          Start your free trial today
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
        >
          No credit card required. Cancel anytime.
        </motion.p>
        <motion.a
          href="/signup"
          className="btn-cta"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.96 }}
        >
          Get Started
        </motion.a>
      </motion.div>
    </motion.section>
  );
}
