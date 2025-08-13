'use client'
import { useState } from 'react';
import { debugConnection, testDifferentUrls } from '@/lib/debug-connection';

export default function DebugPage() {
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostic = async () => {
    setIsRunning(true);
    try {
      const diagnosticResults = await debugConnection();
      setResults(diagnosticResults);
    } catch (error) {
      console.error('Error en diagnóstico:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const testUrls = async () => {
    setIsRunning(true);
    try {
      await testDifferentUrls();
    } catch (error) {
      console.error('Error probando URLs:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🔍 Diagnóstico de Conexión Backend
          </h1>
          <p className="text-gray-600 mb-6">
            Esta página te ayuda a diagnosticar problemas de conexión entre el frontend y el backend.
          </p>
          
          <div className="flex space-x-4">
            <button
              onClick={runDiagnostic}
              disabled={isRunning}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? '🔄 Ejecutando...' : '🚀 Ejecutar Diagnóstico Completo'}
            </button>
            
            <button
              onClick={testUrls}
              disabled={isRunning}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? '🔄 Probando...' : '🌐 Probar Diferentes URLs'}
            </button>
          </div>
        </div>

        {results && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              📊 Resultados del Diagnóstico
            </h2>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Configuración:</h3>
              <p className="text-gray-600">URL Base: <code className="bg-gray-100 px-2 py-1 rounded">{results.configUrl}</code></p>
            </div>

            <div className="space-y-4">
              {results.tests.map((test, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800">{test.name}</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      test.status === 'OK' 
                        ? 'bg-green-100 text-green-800' 
                        : test.status === 'WARNING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {test.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-2">{test.details}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            📋 Pasos para Solucionar Problemas
          </h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-800">1. Verificar que el Backend esté ejecutándose</h3>
              <p className="text-gray-600">
                Asegúrate de que tu proyecto ASP.NET Core esté ejecutándose. 
                Puedes verificarlo abriendo <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:5218</code> en tu navegador.
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-800">2. Verificar el perfil de ejecución</h3>
              <p className="text-gray-600">
                En Visual Studio, asegúrate de que estés usando el perfil <strong>"http"</strong> o <strong>"https"</strong> 
                que corresponda al puerto 5218.
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-800">3. Verificar la consola del navegador</h3>
              <p className="text-gray-600">
                Abre las herramientas de desarrollador (F12) y revisa la consola para ver errores específicos de red.
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-800">4. Verificar CORS</h3>
              <p className="text-gray-600">
                El backend debe tener CORS configurado para permitir peticiones desde <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:3000</code>.
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-800">5. Verificar la base de datos</h3>
              <p className="text-gray-600">
                Asegúrate de que la base de datos esté funcionando y tenga datos. 
                Puedes verificar esto en Swagger: <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:5218</code>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🔧 Comandos Útiles
          </h2>
          
          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Para ejecutar el backend:</h3>
            <code className="block bg-gray-200 p-2 rounded text-sm">
              dotnet run --launch-profile http
            </code>
          </div>
          
          <div className="bg-gray-100 rounded-lg p-4 mt-4">
            <h3 className="font-semibold text-gray-800 mb-2">Para verificar endpoints:</h3>
            <code className="block bg-gray-200 p-2 rounded text-sm">
              curl http://localhost:5218/health
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
