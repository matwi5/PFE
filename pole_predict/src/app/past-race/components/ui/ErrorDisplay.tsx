import React from "react";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface ErrorDisplayProps {
  error: string | null;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Alert className="mb-2 bg-red-900/90 text-white border-red-700">
        <AlertTitle className="text-white">Erreur</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    </div>
  );
};

export default ErrorDisplay;