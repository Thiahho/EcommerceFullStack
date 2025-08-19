# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DrCell is a full-stack e-commerce application for a phone repair shop. The system includes:
- **Backend**: .NET Core 8 Web API with Entity Framework Core and PostgreSQL
- **Frontend**: React 18 with TypeScript, using CRACO and Vite
- **Deployment**: Docker Compose with Nginx reverse proxy
- **Payment Integration**: MercadoPago for payment processing

## Development Commands

### Backend (.NET Core)
```bash
# Run the backend API (from root directory)
dotnet run

# Run with specific environment
dotnet run --environment Development

# Build the project
dotnet build

# Run tests (if available)
dotnet test

# Entity Framework migrations
dotnet ef migrations add <MigrationName>
dotnet ef database update

# Run with watch (auto-reload)
dotnet watch run
```

### Frontend (React)
```bash
# Navigate to frontend directory first
cd Front

# Install dependencies
npm install

# Start development server (uses CRACO)
npm start

# Build for production
npm run build

# Run tests
npm test

# Alternative: Using Vite directly
npx vite dev
```

### Docker Commands
```bash
# Start all services
docker-compose up -d

# Build and start
docker-compose up --build

# View logs
docker-compose logs -f [service-name]

# Stop all services
docker-compose down
```

## Architecture

### Backend Structure
- **Controllers/**: API endpoints organized by feature (Productos, Categorias, etc.)
  - `Controllers/Base/`: Base controller classes with common functionality
  - `Controllers/admin/`: Admin-specific controllers
- **Data/**: Entity Framework context, models, DTOs, and database views
  - `Data/Modelos/`: Entity models (Productos, Categorias, Usuario, etc.)
  - `Data/Dtos/`: Data Transfer Objects for API communication
  - `Data/Vistas/`: Database view models
- **Services/**: Business logic layer with service interfaces
- **Middleware/**: Custom middleware (JWT cookies, rate limiting, Swagger security)
- **HealthChecks/**: Health monitoring for database, memory, and disk

### Frontend Architecture
- **Components/**: React components organized by feature
  - `components/admin/`: Admin panel components
  - `components/ui/`: Reusable UI components (using Radix UI)
  - `components/mp/`: MercadoPago payment components
- **Pages/**: Page-level components
- **Store/**: Zustand state management (auth-store, cart-store)
- **Services/**: API integration services
- **Config/**: Configuration files (axios, whatsapp)

### Key Features
- **Authentication**: JWT-based auth with HTTP-only cookies for security
- **E-commerce**: Product catalog, shopping cart, checkout with MercadoPago
- **Admin Panel**: Product management, category management, user management
- **Repair Quotes**: Dynamic pricing calculator for phone repairs
- **Responsive Design**: TailwindCSS with mobile-first approach

### Database Models
- **Productos**: Products with variants (RAM, storage, color)
- **Categorias**: Product categories
- **Celulares**: Phone models for repair quotes
- **Modulos/Baterias/Pines**: Repair components with pricing
- **Usuarios**: User management with role-based access

## Environment Configuration

### Required Environment Variables (.env)
```
# Database
DATABASE_CONNECTION_STRING=Host=localhost;Database=bdNueva;Username=postgres;Password=456789;Port=5432

# JWT Authentication  
JWT_SECRET=your-super-secret-key-minimum-32-chars
JWT_ISSUER=DrCell-API
JWT_AUDIENCE=DrCell-Client

# CORS
CORS_ORIGINS=http://localhost:3000,https://localhost:5000

# MercadoPago (configured in appsettings.json)
# AccessToken and PublicKey are in appsettings.json

# Docker (for production)
POSTGRES_DB=drcell_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secure_password
ASPNETCORE_ENVIRONMENT=Production
```

### Frontend Environment
- API calls are configured to use `http://localhost:5000` in development
- The frontend uses `withCredentials: true` for cookie-based authentication
- CORS is configured to allow frontend origins in backend

## Common Development Patterns

### Adding New API Endpoints
1. Create controller in appropriate folder (`Controllers/` or `Controllers/admin/`)
2. Inherit from appropriate base controller
3. Add service interface in `Services/Interface/`
4. Implement service in `Services/`
5. Register service in `Program.cs` DI container
6. Add DTOs if needed in `Data/Dtos/`

### Adding New Frontend Components
1. Create component in appropriate folder (`components/`, `pages/`)
2. Use TypeScript with proper interface definitions
3. Follow existing patterns for API calls using the configured axios instance
4. Use Zustand stores for state management
5. Apply TailwindCSS for styling following existing patterns

### Database Changes
1. Modify models in `Data/Modelos/`
2. Update `ApplicationDbContext.cs` if needed
3. Run `dotnet ef migrations add <MigrationName>`
4. Run `dotnet ef database update`
5. Update any related DTOs and services

## Security Considerations
- JWT tokens are stored in HTTP-only cookies (not localStorage)
- CORS is strictly configured per environment
- Rate limiting is implemented with different policies
- Environment variables are used for sensitive configuration
- HTTPS is enforced in production
- MercadoPago tokens are securely configured

## Testing
- Backend: Standard .NET testing patterns (not yet implemented)
- Frontend: Jest and React Testing Library (configured but minimal tests)
- Health checks available at `/health`, `/health/live`, `/health/ready`

## Deployment
- Production deployment uses Docker Compose
- Nginx serves as reverse proxy and static file server
- PostgreSQL database with persistent volumes
- Redis for caching (optional, configured but not actively used)
- Environment-specific configuration through .env files