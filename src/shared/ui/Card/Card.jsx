import styles from './Card.module.css';

export const Card = ({ 
  children, 
  variant = 'default',
  padding = 'md',
  hoverable = false,
  className = '',
  ...props 
}) => {
  const cardClass = `
    ${styles.card} 
    ${styles[variant]} 
    ${styles[padding]} 
    ${hoverable ? styles.hoverable : ''}
    ${className}
  `.trim();

  return (
    <div className={cardClass} {...props}>
      {children}
    </div>
  );
};
