// Script de diagnóstico para problemas de conexión
import { config } from './config';

export const debugConnection = async () => {
  console.log('🔍 Iniciando diagnóstico de conexión...');
  console.log('📍 URL configurada:', config.API_BASE_URL);
  
  const results = {
    configUrl: config.API_BASE_URL,
    tests: []
  };

  // Test 1: Verificar configuración
  console.log('\n📋 Test 1: Verificar configuración');
  console.log('- URL base:', config.API_BASE_URL);
  console.log('- Protocolo:', config.API_BASE_URL.startsWith('https') ? 'HTTPS' : 'HTTP');
  console.log('- Puerto:', config.API_BASE_URL.split(':').pop());
  
  results.tests.push({
    name: 'Configuración',
    status: 'OK',
    details: `URL: ${config.API_BASE_URL}`
  });

  // Test 2: Verificar endpoint de salud
  console.log('\n🏥 Test 2: Verificar endpoint de salud');
  try {
    const healthResponse = await fetch(`${config.API_BASE_URL}/health`);
    console.log('- Status:', healthResponse.status);
    console.log('- OK:', healthResponse.ok);
    console.log('- Texto:', await healthResponse.text());
    
    results.tests.push({
      name: 'Endpoint de Salud',
      status: healthResponse.ok ? 'OK' : 'ERROR',
      details: `Status: ${healthResponse.status}`
    });
  } catch (error) {
    console.log('- Error:', error.message);
    results.tests.push({
      name: 'Endpoint de Salud',
      status: 'ERROR',
      details: `Error: ${error.message}`
    });
  }

  // Test 3: Verificar endpoint de productos
  console.log('\n📦 Test 3: Verificar endpoint de productos');
  try {
    const productsResponse = await fetch(`${config.API_BASE_URL}/Productos`);
    console.log('- Status:', productsResponse.status);
    console.log('- OK:', productsResponse.ok);
    
    if (productsResponse.ok) {
      const products = await productsResponse.json();
      console.log('- Productos encontrados:', products.length);
    }
    
    results.tests.push({
      name: 'Endpoint de Productos',
      status: productsResponse.ok ? 'OK' : 'ERROR',
      details: `Status: ${productsResponse.status}`
    });
  } catch (error) {
    console.log('- Error:', error.message);
    results.tests.push({
      name: 'Endpoint de Productos',
      status: 'ERROR',
      details: `Error: ${error.message}`
    });
  }

  // Test 4: Verificar endpoint de categorías
  console.log('\n🏷️ Test 4: Verificar endpoint de categorías');
  try {
    const categoriesResponse = await fetch(`${config.API_BASE_URL}/Categorias`);
    console.log('- Status:', categoriesResponse.status);
    console.log('- OK:', categoriesResponse.ok);
    
    if (categoriesResponse.ok) {
      const categories = await categoriesResponse.json();
      console.log('- Categorías encontradas:', categories.length);
    }
    
    results.tests.push({
      name: 'Endpoint de Categorías',
      status: categoriesResponse.ok ? 'OK' : 'ERROR',
      details: `Status: ${categoriesResponse.status}`
    });
  } catch (error) {
    console.log('- Error:', error.message);
    results.tests.push({
      name: 'Endpoint de Categorías',
      status: 'ERROR',
      details: `Error: ${error.message}`
    });
  }

  // Test 5: Verificar CORS
  console.log('\n🌐 Test 5: Verificar CORS');
  try {
    const corsResponse = await fetch(`${config.API_BASE_URL}/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000'
      }
    });
    console.log('- CORS Status:', corsResponse.status);
    console.log('- Access-Control-Allow-Origin:', corsResponse.headers.get('Access-Control-Allow-Origin'));
    
    results.tests.push({
      name: 'CORS',
      status: corsResponse.status === 200 ? 'OK' : 'WARNING',
      details: `Status: ${corsResponse.status}`
    });
  } catch (error) {
    console.log('- CORS Error:', error.message);
    results.tests.push({
      name: 'CORS',
      status: 'ERROR',
      details: `Error: ${error.message}`
    });
  }

  // Resumen
  console.log('\n📊 RESUMEN DEL DIAGNÓSTICO:');
  console.log('='.repeat(50));
  
  const passedTests = results.tests.filter(t => t.status === 'OK').length;
  const totalTests = results.tests.length;
  
  results.tests.forEach(test => {
    const icon = test.status === 'OK' ? '✅' : test.status === 'WARNING' ? '⚠️' : '❌';
    console.log(`${icon} ${test.name}: ${test.status} - ${test.details}`);
  });
  
  console.log(`\n📈 Resultado: ${passedTests}/${totalTests} tests pasaron`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ¡Conexión perfecta!');
  } else if (passedTests > 0) {
    console.log('⚠️ Conexión parcial, algunos problemas detectados');
  } else {
    console.log('❌ Conexión fallida, revisa la configuración');
  }
  
  return results;
};

// Función para probar diferentes URLs
export const testDifferentUrls = async () => {
  const urls = [
    'http://localhost:5218',
    'https://localhost:5218',
    'http://localhost:7204',
    'https://localhost:7204'
  ];
  
  console.log('🧪 Probando diferentes URLs...');
  
  for (const url of urls) {
    try {
      console.log(`\n🔗 Probando: ${url}`);
      const response = await fetch(`${url}/health`);
      console.log(`   Status: ${response.status} - ${response.ok ? '✅' : '❌'}`);
      
      if (response.ok) {
        const text = await response.text();
        console.log(`   Respuesta: ${text}`);
      }
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }
  }
};
