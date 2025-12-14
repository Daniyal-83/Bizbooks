import React from 'react';
import { motion } from 'framer-motion';
import '../../styles/Loading.css';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = '#2ca01c', 
  text = 'Loading...',
  showText = true,
  className = '' 
}) => {
  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large'
  };

  return (
    <motion.div
      className={`loading-container ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`loading-spinner ${sizeClasses[size]}`} style={{ borderTopColor: color }}>
        <div className="spinner-inner"></div>
      </div>
      {showText && text && (
        <motion.p
          className="loading-text"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );
};

export default LoadingSpinner;
