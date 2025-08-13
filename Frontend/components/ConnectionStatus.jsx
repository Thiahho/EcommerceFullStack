'use client'
import { useState, useEffect } from 'react';
import { checkApiHealth } from '@/lib/test-connection';
import { debugConnection } from '@/lib/debug-connection';

export default function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      setIsChecking(true);
      try {
        const health = await checkApiHealth();
        setIsConnected(health);
      } catch (error) {
        setIsConnected(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkConnection();
    
    // Verificar cada 30 segundos
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isChecking) {
    return (
      <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
          <span className="text-sm font-medium">Verificando conexión...</span>
        </div>
      </div>
    );
  }

  if (isConnected === null) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 px-4 py-2 rounded shadow-lg ${
      isConnected 
        ? 'bg-green-100 border border-green-400 text-green-800' 
        : 'bg-red-100 border border-red-400 text-red-800'
    }`}>
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`}></div>
        <span className="text-sm font-medium">
          {isConnected ? 'Backend Conectado' : 'Backend Desconectado'}
        </span>
        {!isConnected && (
          <button 
            onClick={() => debugConnection()}
            className="ml-2 text-xs underline hover:no-underline"
          >
            Diagnosticar
          </button>
        )}
      </div>
      {!isConnected && (
        <div className="mt-2 text-xs">
          Verifica que el backend esté ejecutándose en http://localhost:5218
        </div>
      )}
    </div>
  );
}
