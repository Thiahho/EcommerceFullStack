# Conexión Frontend-Backend Ecommerce

Este documento explica cómo está configurada la conexión entre el frontend (Next.js) y el backend (ASP.NET Core).

## 🚀 Configuración Inicial

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto Frontend:

```bash
# Configuración de la API Backend
NEXT_PUBLIC_API_URL=http://localhost:5218

# Configuración de la moneda
NEXT_PUBLIC_CURRENCY=USD
```

**Nota:** El puerto `5218` corresponde a HTTP en el backend. Si usas HTTPS, cambia a `https://localhost:5218`.

### 2. Verificar que el Backend esté ejecutándose

Asegúrate de que tu proyecto ASP.NET Core esté ejecutándose en:
- HTTP: `http://localhost:5218` (recomendado para desarrollo)
- HTTPS: `https://localhost:5218` (si prefieres usar HTTPS)

## 📁 Estructura de Archivos

```
Frontend/
├── lib/
│   ├── api.js              # Servicios API principales
│   ├── config.js           # Configuración del backend
│   └── hooks/
│       ├── useProducts.js  # Hook para productos
│       └── useCategories.js # Hook para categorías
├── components/
│   └── ProductList.jsx     # Componente de ejemplo
└── context/
    └── AppContext.jsx      # Contexto global actualizado
```

## 🔌 Servicios API Disponibles

### Productos (`productosService`)

```javascript
import { productosService } from '@/lib/api';

// Obtener todos los productos
const productos = await productosService.getAll();

// Obtener producto por ID
const producto = await productosService.getById(1);

// Obtener todas las variantes
const variantes = await productosService.getAllVariantes();

// Obtener variantes de un producto específico
const variantesProducto = await productosService.getVariantesByProduct(1);

// Obtener opciones de RAM de un producto
const ramOpciones = await productosService.getRamOpciones(1);
```

### Categorías (`categoriasService`)

```javascript
import { categoriasService } from '@/lib/api';

// Obtener todas las categorías
const categorias = await categoriasService.getAll();

// Obtener categoría por ID
const categoria = await categoriasService.getById(1);
```

### Autenticación (`authService`)

```javascript
import { authService } from '@/lib/api';

// Login
const loginResult = await authService.login({
  email: 'usuario@ejemplo.com',
  password: 'password123'
});

// Registro
const registroResult = await authService.register({
  nombre: 'Usuario',
  email: 'usuario@ejemplo.com',
  password: 'password123'
});
```

## 🎣 Hooks Personalizados

### useProducts

```javascript
import { useProducts } from '@/lib/hooks/useProducts';

function MiComponente() {
  const { 
    products, 
    loading, 
    error, 
    fetchProducts,
    getProductById,
    getProductVariants 
  } = useProducts();

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.nombre}</div>
      ))}
    </div>
  );
}
```

### useCategories

```javascript
import { useCategories } from '@/lib/hooks/useCategories';

function MiComponente() {
  const { 
    categories, 
    loading, 
    error, 
    fetchCategories 
  } = useCategories();

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {categories.map(category => (
        <div key={category.id}>{category.nombre}</div>
      ))}
    </div>
  );
}
```

## 🔧 Uso en el Contexto Global

El `AppContext` ya está configurado para usar los datos del backend:

```javascript
import { useAppContext } from '@/context/AppContext';

function MiComponente() {
  const { 
    products, 
    categories, 
    loading, 
    error,
    fetchProductData,
    fetchCategoriesData 
  } = useAppContext();

  // Los datos se cargan automáticamente al montar el componente
  // También puedes recargar manualmente:
  const handleRefresh = () => {
    fetchProductData();
    fetchCategoriesData();
  };

  return (
    <div>
      {loading && <div>Cargando...</div>}
      {error && <div>Error: {error}</div>}
      {/* Tu contenido aquí */}
    </div>
  );
}
```

## 🚨 Manejo de Errores

El sistema incluye manejo de errores robusto:

1. **Fallback a datos dummy**: Si la API falla, se usan datos de ejemplo
2. **Logging de errores**: Todos los errores se registran en consola
3. **Estados de carga**: Indicadores visuales durante las peticiones
4. **Reintentos**: Botones para reintentar operaciones fallidas

## 🔒 Seguridad

- **CORS**: Configurado en el backend para permitir solo orígenes confiables
- **HTTPS**: Recomendado para producción
- **Validación**: Todos los datos se validan en el backend
- **Rate Limiting**: Implementado en el backend para prevenir abuso

## 🧪 Testing

Para probar la conexión:

1. **Verificar que el backend esté ejecutándose**
2. **Revisar la consola del navegador** para errores de red
3. **Usar el componente ProductList** como ejemplo
4. **Verificar las variables de entorno** están correctas

## 🐛 Troubleshooting

### Error de CORS
- Verifica que el backend tenga CORS configurado correctamente
- Asegúrate de que la URL del frontend esté en la lista de orígenes permitidos

### Error de Conexión
- Verifica que el backend esté ejecutándose
- Confirma la URL y puerto en las variables de entorno
- Revisa que no haya firewall bloqueando la conexión

### Datos no se cargan
- Revisa la consola del navegador para errores
- Verifica que los endpoints del backend estén funcionando
- Confirma que la base de datos tenga datos

## 📚 Recursos Adicionales

- [Documentación de Axios](https://axios-http.com/)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [React Hooks](https://react.dev/reference/react/hooks)

