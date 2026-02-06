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
        bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-4
        ${clickable ? 'cursor-pointer hover:shadow-xl transition-shadow' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
