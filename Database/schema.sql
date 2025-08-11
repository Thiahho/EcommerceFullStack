-- Script de creación de base de datos para Ecommerce API
-- Ejecutar en PostgreSQL

-- Crear base de datos (ejecutar como superusuario)
-- CREATE DATABASE ecommerce_dev;

-- Conectar a la base de datos
-- \c ecommerce_dev;

-- Crear tabla de categorías
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (rol IN ('USER', 'ADMIN')),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de productos
CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    marca VARCHAR(50) NOT NULL,
    descripcion TEXT NOT NULL,
    images BYTEA,
    categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(marca, nombre)
);

-- Crear tabla de variantes de productos
CREATE TABLE IF NOT EXISTS productos_variantes (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    stock INTEGER NOT NULL CHECK (stock >= 0),
    precio DECIMAL(18,2) NOT NULL CHECK (precio > 0),
    descuento DECIMAL(5,2) DEFAULT 0 CHECK (descuento >= 0 AND descuento <= 100),
    descripcion VARCHAR(500),
    almacenamiento VARCHAR(50),
    ram VARCHAR(20),
    color VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(producto_id, ram, almacenamiento, color)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_productos_marca_nombre ON productos(marca, nombre);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_variantes_producto ON productos_variantes(producto_id);
CREATE INDEX IF NOT EXISTS idx_variantes_especificaciones ON productos_variantes(producto_id, ram, almacenamiento, color);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);

-- Crear función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear triggers para actualizar timestamps
CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_variantes_updated_at BEFORE UPDATE ON productos_variantes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar datos de ejemplo

-- Categorías
INSERT INTO categorias (nombre, descripcion) VALUES
('Smartphones', 'Teléfonos inteligentes y móviles'),
('Laptops', 'Computadoras portátiles'),
('Tablets', 'Dispositivos táctiles portátiles'),
('Accesorios', 'Accesorios para dispositivos electrónicos')
ON CONFLICT (nombre) DO NOTHING;

-- Usuario administrador (password: admin123)
INSERT INTO usuarios (email, password_hash, nombre, apellido, rol) VALUES
('admin@ecommerce.com', '$2a$11$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'Sistema', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Productos de ejemplo
INSERT INTO productos (nombre, marca, descripcion, categoria_id) VALUES
('iPhone 15 Pro', 'Apple', 'El iPhone más avanzado de Apple con chip A17 Pro', 1),
('Samsung Galaxy S24', 'Samsung', 'Flagship de Samsung con IA integrada', 1),
('MacBook Pro M3', 'Apple', 'Laptop profesional con chip M3', 2),
('Dell XPS 13', 'Dell', 'Laptop ultrabook premium', 2)
ON CONFLICT (marca, nombre) DO NOTHING;

-- Variantes de ejemplo
INSERT INTO productos_variantes (producto_id, stock, precio, color, ram, almacenamiento) VALUES
(1, 50, 999.99, 'Negro', '8GB', '256GB'),
(1, 30, 1199.99, 'Negro', '8GB', '512GB'),
(1, 25, 999.99, 'Blanco', '8GB', '256GB'),
(2, 40, 899.99, 'Negro', '8GB', '128GB'),
(2, 35, 999.99, 'Negro', '8GB', '256GB'),
(3, 20, 1999.99, 'Gris Espacial', '16GB', '512GB'),
(3, 15, 2499.99, 'Gris Espacial', '16GB', '1TB'),
(4, 30, 1299.99, 'Plata', '16GB', '512GB')
ON CONFLICT (producto_id, ram, almacenamiento, color) DO NOTHING;

-- Crear vista para productos con información completa
CREATE OR REPLACE VIEW v_productos_completos AS
SELECT 
    p.id,
    p.nombre,
    p.marca,
    p.descripcion,
    p.images,
    p.categoria_id,
    c.nombre as categoria_nombre,
    COUNT(pv.id) as total_variantes,
    MIN(pv.precio) as precio_minimo,
    MAX(pv.precio) as precio_maximo,
    SUM(pv.stock) as stock_total,
    p.created_at,
    p.updated_at
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN productos_variantes pv ON p.id = pv.producto_id
GROUP BY p.id, p.nombre, p.marca, p.descripcion, p.images, p.categoria_id, c.nombre, p.created_at, p.updated_at;

-- Crear vista para variantes con información del producto
CREATE OR REPLACE VIEW v_variantes_completas AS
SELECT 
    pv.id,
    pv.producto_id,
    p.nombre as producto_nombre,
    p.marca as producto_marca,
    pv.stock,
    pv.precio,
    pv.descuento,
    pv.descripcion,
    pv.almacenamiento,
    pv.ram,
    pv.color,
    pv.created_at,
    pv.updated_at
FROM productos_variantes pv
JOIN productos p ON pv.producto_id = p.id;

-- Comentarios en las tablas
COMMENT ON TABLE categorias IS 'Tabla de categorías de productos';
COMMENT ON TABLE usuarios IS 'Tabla de usuarios del sistema';
COMMENT ON TABLE productos IS 'Tabla de productos principales';
COMMENT ON TABLE productos_variantes IS 'Tabla de variantes de productos (stock, precio, especificaciones)';

COMMENT ON COLUMN productos.images IS 'Imagen del producto en formato bytea (base64)';
COMMENT ON COLUMN productos_variantes.stock IS 'Cantidad disponible en inventario';
COMMENT ON COLUMN productos_variantes.precio IS 'Precio del producto en la moneda local';
COMMENT ON COLUMN productos_variantes.descuento IS 'Porcentaje de descuento (0-100)';
COMMENT ON COLUMN productos_variantes.ram IS 'Memoria RAM del dispositivo';
COMMENT ON COLUMN productos_variantes.almacenamiento IS 'Capacidad de almacenamiento';
COMMENT ON COLUMN productos_variantes.color IS 'Color del dispositivo';

-- Verificar la creación
SELECT 'Base de datos creada exitosamente' as mensaje;
SELECT COUNT(*) as total_categorias FROM categorias;
SELECT COUNT(*) as total_productos FROM productos;
SELECT COUNT(*) as total_variantes FROM productos_variantes;
SELECT COUNT(*) as total_usuarios FROM usuarios;


