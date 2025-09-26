import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
import Hero from "../components/Hero"; 
import FeaturesSection from "../components/FeaturesSection";
import CTASection from "../components/CTASection";
import GallerySection from "../components/GallerySection";
import PartnersSection from "../components/PartnersSection";
import HowItWorksSection from "../components/HowItWorksSection";
import "../styles/Home.css";

export default function Home() {
  return (
    <motion.div
      className="home-hero"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h1>
        Welcome to <span className="accent">BizBooks</span>
      </h1>
      <p className="subtitle">
        Your trusted financial management solution.
        <br />
        <FaCheckCircle style={{ color: "#2ca01c", marginRight: 6 }} />
        Simplify your accounting with ease.
      </p>
      <motion.button
        className="cta-btn"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => (window.location.href = "/signup")}
      >
        Get Started
      </motion.button>

    
      <Hero />
      <FeaturesSection />
      <GallerySection />
      <PartnersSection />
      <HowItWorksSection />
      <CTASection />
    </motion.div>
  );
}
