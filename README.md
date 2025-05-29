# MROI (Multiple Region of Interest)

A comprehensive system for managing multiple regions of interest in RTSP (Real-Time Streaming Protocol), consisting of a React-Vite frontend and Node.js backend.

## Project Overview

This repository contains two main components:
- **mroi_app**: Frontend React-Vite application
- **mroi_server**: Backend Node.js server

## Features

### Frontend (mroi_app)
- Interactive ROI drawing interface with Konva.js
- Multiple ROI types support:
  - Intrusion detection zones
  - Tripwire monitoring lines
  - Density detection areas
  - Zoom regions (max 1 per camera)
- Real-time camera snapshot viewing
- Flexible scheduling system
- Responsive design for all screen sizes

### Backend (mroi_server)
- RTSP stream handling with FFmpeg
- Real-time snapshot generation
- Multi-workspace support
- PostgreSQL database integration
- RESTful API endpoints
- Error handling and logging

## Prerequisites

### Frontend Requirements
- Node.js 16.x or higher
- npm 8.x or higher
- Modern web browser with Antd design

### Backend Requirements
- Node.js 16.x or higher
- npm 8.x or higher
- FFmpeg 4.x or higher
- PostgreSQL 14.x or higher
- Python 3.8+ (for AI processing)

## Quick Start

1. Install FFmpeg (on macOS):
```bash
brew install ffmpeg
```

2. Clone the repository:
```bash
git clone https://github.com/PrasitPaisan/mroi.git
cd mroi
```

3. Install and start the backend:
```bash
cd mroi_server
npm install
npm run dev
```

4. Install and start the frontend:
```bash
cd ../mroi_app
npm install
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Project Structure

```
mroi/
├── mroi_app/           # Frontend application
│   ├── src/           # React source code
│   │   ├── components/# React components
│   │   ├── styles/    # CSS styles
│   │   └── utils/     # Utility functions
│   └── package.json   # Dependencies
├── mroi_server/       # Backend server
│   ├── server/        # Server source code
│   ├── config/        # Configuration
│   └── package.json   # Dependencies
└── docs/             # Documentation
```

## Environment Setup

1. Backend (.env):
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=mroi_db
JWT_SECRET=your_secret_key
```

2. Frontend (.env):
```env
VITE_API_ENDPOINT=http://localhost:3001
VITE_CREATOR=your_name
```

## Development

1. Start the backend server:
```bash
cd mroi_server
npm run dev
```

2. Start the frontend development server:
```bash
cd mroi_app
npm run dev
```

## Authors

- [@PrasitPaisan](https://github.com/PrasitPaisan)
