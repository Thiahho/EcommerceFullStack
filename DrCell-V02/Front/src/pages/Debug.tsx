import React from 'react';
import DebugConnection from '@/components/DebugConnection';

const Debug: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <DebugConnection />
    </div>
  );
};

export default Debug;
