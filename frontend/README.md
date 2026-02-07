# StoreHub Frontend

A React-based frontend for the StoreHub management system built with Vite.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and set your API URL:
```
VITE_API_URL=http://localhost:8000
```

3. Start the development server:
```bash
npm run dev
```

## Features

- **Multi-role Dashboard**: Support for shop owners, customers, and company admins
- **Real-time Updates**: Live data synchronization
- **Responsive Design**: Mobile-friendly interface
- **Secure Authentication**: OTP-based login system
- **File Upload**: Bulk customer import functionality

## Delete Confirmations

All delete operations now include:
- **Specific Item Names**: Shows exactly what will be deleted
- **Warning Messages**: Clear indication of permanent actions
- **Visual Indicators**: Warning icons and proper styling
- **Consistent UX**: Same confirmation flow across all sections

## Browser Compatibility

- Uses environment variables for API URLs to prevent security warnings
- No hardcoded localhost references in production builds
- Responsive design for all screen sizes
