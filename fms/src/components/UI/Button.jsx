import React from 'react';
import { motion } from 'framer-motion';
import '../../styles/Button.css';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseClasses = `btn btn-${variant} btn-${size}`;
  const classes = `${baseClasses} ${className} ${disabled ? 'btn-disabled' : ''}`.trim();

  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <div className="btn-spinner"></div>
          <span>Loading...</span>
        </>
      );
    }

    if (icon) {
      return (
        <>
          {iconPosition === 'left' && icon}
          <span>{children}</span>
          {iconPosition === 'right' && icon}
        </>
      );
    }

    return children;
  };

  return (
    <motion.button
      type={type}
      className={classes}
      onClick={handleClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {renderContent()}
    </motion.button>
  );
};

export default Button;
