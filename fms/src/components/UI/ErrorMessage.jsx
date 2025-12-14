import React from 'react';
import { motion } from 'framer-motion';
import { FaExclamationTriangle, FaRedoAlt, FaHome } from 'react-icons/fa';
import Button from './Button';
import '../../styles/Error.css';

const ErrorMessage = ({ 
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  type = 'error',
  onRetry,
  onGoHome,
  showRetry = true,
  showGoHome = false,
  className = ''
}) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <FaExclamationTriangle />;
      case 'warning':
        return <FaExclamationTriangle />;
      case 'info':
        return <FaExclamationTriangle />;
      default:
        return <FaExclamationTriangle />;
    }
  };

  const getTypeClass = () => {
    switch (type) {
      case 'error':
        return 'error-error';
      case 'warning':
        return 'error-warning';
      case 'info':
        return 'error-info';
      default:
        return 'error-error';
    }
  };

  return (
    <motion.div
      className={`error-container ${getTypeClass()} ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="error-icon">
        {getIcon()}
      </div>
      
      <div className="error-content">
        <h3 className="error-title">{title}</h3>
        <p className="error-message">{message}</p>
        
        <div className="error-actions">
          {showRetry && onRetry && (
            <Button
              variant="primary"
              onClick={onRetry}
              icon={<FaRedoAlt />}
            >
              Try Again
            </Button>
          )}
          
          {showGoHome && onGoHome && (
            <Button
              variant="secondary"
              onClick={onGoHome}
              icon={<FaHome />}
            >
              Go Home
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ErrorMessage;
