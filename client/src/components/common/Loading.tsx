import React from 'react';

export default function Loading({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex w-full items-center justify-center py-6 text-muted-foreground">
      <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </div>
  );
}


