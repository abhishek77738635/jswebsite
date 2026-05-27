import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Spinner({ className = 'w-8 h-8', label }) {
  return (
    <span className="inline-flex flex-col items-center justify-center gap-2 text-blue-600" role="status" aria-busy="true">
      <Loader2 className={`${className} animate-spin`} aria-hidden />
      {label ? <span className="text-sm text-gray-600">{label}</span> : null}
    </span>
  );
}
