import styles from './Button.module.css';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  icon,
  onClick,
  type = 'button',
  className = '',
  ...props 
}) => {
  const buttonClass = `
    ${styles.button} 
    ${styles[variant]} 
    ${styles[size]} 
    ${disabled ? styles.disabled : ''} 
    ${loading ? styles.loading : ''}
    ${className}
  `.trim();

  return (
    <button
      type={type}
      className={buttonClass}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <span className={styles.spinner} />}
      {icon && !loading && <span className={styles.icon}>{icon}</span>}
      <span className={styles.content}>{children}</span>
    </button>
  );
};
