import React, { useState } from 'react';
import api from '@/config/axios';

/**
 * Componente para debuggear la conexión con el backend
 */
const DebugConnection: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (test: string, success: boolean, data: any, error?: any) => {
    const result = {
      test,
      success,
      data,
      error: error?.message || error,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [result, ...prev]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  // Test 1: Conectividad básica
  const testBasicConnection = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/Pagos/test');
      addResult('🔧 Test básico /Pagos/test', true, response.data);
    } catch (error: any) {
      addResult('🔧 Test básico /Pagos/test', false, null, error);
    }
    setIsLoading(false);
  };

  // Test 2: Public Key
  const testPublicKey = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/Pagos/mercadopago/public-key');
      addResult('🔑 Test Public Key', true, response.data);
    } catch (error: any) {
      addResult('🔑 Test Public Key', false, null, error);
    }
    setIsLoading(false);
  };

  // Test 3: Crear preferencia con datos de prueba
  const testCreatePreference = async () => {
    setIsLoading(true);
    const testData = {
      items: [{
        ProductoId: 1,
        VarianteId: 1,
        Marca: "TEST",
        Modelo: "Debug Model",
        Ram: "8GB",
        Almacenamiento: "256GB",
        Color: "Negro",
        Cantidad: 1,
        Precio: 100000
      }]
    };

    try {
      const response = await api.post('/Pagos/crear-preferencia', testData);
      addResult('💳 Test Crear Preferencia', true, response.data);
    } catch (error: any) {
      addResult('💳 Test Crear Preferencia', false, null, error);
    }
    setIsLoading(false);
  };

  // Test directo con fetch (sin axios)
  const testDirectFetch = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/Pagos/test');
      const data = await response.json();
      addResult('🌐 Test directo con fetch', response.ok, data);
    } catch (error: any) {
      addResult('🌐 Test directo con fetch', false, null, error);
    }
    setIsLoading(false);
  };

  const runAllTests = async () => {
    clearResults();
    await testDirectFetch();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testBasicConnection();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testPublicKey();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testCreatePreference();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          🔍 Debug: Conexión Backend
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Este componente te ayuda a diagnosticar problemas de conexión con el backend.
          </p>
          
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={runAllTests}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
            >
              {isLoading ? '⏳ Ejecutando...' : '🚀 Ejecutar Todos los Tests'}
            </button>
            
            <button
              onClick={testDirectFetch}
              disabled={isLoading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              🌐 Test Directo
            </button>
            
            <button
              onClick={testBasicConnection}
              disabled={isLoading}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              🔧 Test Básico
            </button>
            
            <button
              onClick={testPublicKey}
              disabled={isLoading}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
            >
              🔑 Test Public Key
            </button>
            
            <button
              onClick={testCreatePreference}
              disabled={isLoading}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              💳 Test Preferencia
            </button>
            
            <button
              onClick={clearResults}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              🗑️ Limpiar
            </button>
          </div>
        </div>

        {/* Información del sistema */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">📋 Información del Sistema:</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>URL Backend esperada:</strong> http://localhost:5000</p>
            <p><strong>Endpoint principal:</strong> POST /Pagos/crear-preferencia</p>
            <p><strong>User Agent:</strong> {navigator.userAgent}</p>
            <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
          </div>
        </div>

        {/* Resultados */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">📊 Resultados de Tests:</h3>
          
          {testResults.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No hay resultados aún. Ejecuta un test para comenzar.
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    result.success 
                      ? 'bg-green-50 border-green-500' 
                      : 'bg-red-50 border-red-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-semibold ${
                      result.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {result.success ? '✅' : '❌'} {result.test}
                    </h4>
                    <span className="text-xs text-gray-500">{result.timestamp}</span>
                  </div>
                  
                  {result.data && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-700 mb-1">Respuesta:</p>
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {result.error && (
                    <div>
                      <p className="text-sm font-medium text-red-700 mb-1">Error:</p>
                      <pre className="text-xs bg-red-100 p-2 rounded overflow-x-auto text-red-800">
                        {typeof result.error === 'string' ? result.error : JSON.stringify(result.error, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instrucciones de solución */}
        <div className="bg-yellow-50 p-4 rounded-lg mt-6">
          <h3 className="font-semibold text-yellow-800 mb-2">💡 Posibles Soluciones:</h3>
          <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
            <li>Verifica que el backend esté ejecutándose: <code>cd DrCell-V02 && dotnet run</code></li>
            <li>Confirma que esté escuchando en el puerto 5000</li>
            <li>Revisa los logs del backend para errores</li>
            <li>Verifica que no haya firewall bloqueando el puerto</li>
            <li>Asegúrate de que las credenciales de MercadoPago estén configuradas en appsettings.json</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DebugConnection;
