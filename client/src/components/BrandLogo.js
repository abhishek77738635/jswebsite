import React from 'react';

export function BrandTitle({ className = '' }) {
  return (
    <h1 className={`truncate text-base font-bold sm:text-lg ${className}`}>
      <span className="text-teal-600 dark:text-teal-400">Up</span>
      <span className="text-gray-900 dark:text-gray-100">challenges</span>
    </h1>
  );
}

export function BrandSlogan({ className = 'text-xs text-gray-500 dark:text-gray-400' }) {
  return <p className={`truncate ${className}`}>Level Up Your Logic.</p>;
}

export default function BrandLogo({ showSlogan = true, titleClassName, sloganClassName }) {
  return (
    <div className="min-w-0">
      <BrandTitle className={titleClassName} />
      {showSlogan ? <BrandSlogan className={sloganClassName} /> : null}
    </div>
  );
}
