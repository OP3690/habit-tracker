import React from 'react';

export default function Logo({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      {/* Outer ring */}
      <circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="2" fill="#e0fbe6" />
      {/* Middle ring */}
      <circle cx="12" cy="12" r="6" stroke="#22c55e" strokeWidth="1.5" fill="#fff" />
      {/* Checkmark, centered and slightly smaller */}
      <path d="M10.2 12.3l1.3 1.3 2.3-2.6" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
} 