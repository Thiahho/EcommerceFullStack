# DrCell Frontend

Frontend application for DrCell phone repair shop system.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup

1. Install dependencies:
```powershell
.\install-dependencies.ps1
```

2. Start the development server:
```powershell
npm start
```

The application will be available at http://localhost:3000

## Features

- Home page with service overview
- Repair quote calculator
- Phone brand and model selection
- Real-time price calculation for:
  - Module repairs
  - Battery replacement
  - Charging port repairs

## Development

The project uses:
- React with TypeScript
- Material-UI for components
- React Router for navigation
- Axios for API calls

## API Integration

The frontend connects to the backend API at http://localhost:5000. Make sure the backend server is running before using the application. 