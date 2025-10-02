'use client';

import React from 'react';

interface GradientIconProps {
  icon: React.ComponentType<{ className?: string }>;
  variant: 'yellow' | 'blue' | 'purple' | 'orange' | 'green' | 'teal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

export const GradientIcon: React.FC<GradientIconProps> = ({
  icon: Icon,
  variant,
  size = 'md',
  className = '',
  onClick
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10'
  };

  const gradientClasses = {
    yellow: 'bg-gradient-to-br from-cpn-yellow to-yellow-600',
    blue: 'bg-gradient-to-br from-sky-300 to-blue-600',
    purple: 'bg-gradient-to-br from-purple-300 to-purple-700',
    orange: 'bg-gradient-to-br from-orange-400 to-red-600',
    green: 'bg-gradient-to-br from-green-300 to-green-700',
    teal: 'bg-gradient-to-br from-cyan-300 to-teal-600'
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${gradientClasses[variant]}
        rounded-full
        flex items-center justify-center
        shadow-lg
        transition-all duration-300 ease-out
        hover:shadow-xl hover:-translate-y-1 hover:scale-105
        active:scale-95 active:translate-y-0
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <Icon className={`${iconSizeClasses[size]} text-gray-900`} />
    </div>
  );
};