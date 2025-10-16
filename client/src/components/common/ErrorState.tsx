import React from 'react';
import { Button } from '@/components/ui/button';

export default function ErrorState({ message = 'Something went wrong.', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex w-full items-center justify-between rounded border p-3 text-sm text-destructive">
      <span>{message}</span>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>Retry</Button>
      )}
    </div>
  );
}


