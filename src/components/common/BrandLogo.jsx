import React from 'react';
import logoDark from '../../assets/learnspace-logo-transparent.png';
import logoWhite from '../../assets/learnspace-logo-white.png';

export default function BrandLogo({ 
  variant = 'dark', 
  className = 'h-9', 
  onClick,
  interactive = false 
}) {
  const src = variant === 'white' ? logoWhite : logoDark;
  
  return (
    <div 
      onClick={onClick}
      className={`inline-flex items-center select-none ${interactive ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
    >
      <img 
        src={src} 
        alt="LearnSpace" 
        className={`${className} w-auto object-contain`} 
      />
    </div>
  );
}
