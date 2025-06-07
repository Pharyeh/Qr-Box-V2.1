# QR Box v2.1

A market analysis tool that provides real-time market data and analysis.

## Setup

1. Install dependencies:
```bash
npm run install-all
```

2. Start the development servers:
```bash
npm start
```

This will start both the backend server (port 5001) and frontend development server (port 5173).

## Project Structure

- `/client` - Frontend React application
- `/server` - Backend Node.js server
  - `/controllers` - API route controllers
  - `/routes` - API route definitions
  - `/utils` - Utility functions

## Environment Variables

Create a `.env` file in the server directory with the following variables:
```
OPENAI_API_KEY=your_openai_api_key
```

## Features

- Real-time market data
- Technical analysis
- Market sentiment analysis
- Custom alerts and notifications 