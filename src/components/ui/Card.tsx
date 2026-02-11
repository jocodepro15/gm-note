import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className = '', onClick }: CardProps) {
  const clickable = onClick !== undefined;

  return (
    <div
      className={`
        rounded-2xl p-4 transition-all duration-300
        ${clickable ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (clickable) {
          e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 15px rgba(16, 185, 129, 0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (clickable) {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
        }
      }}
    >
      {children}
    </div>
  );
}
