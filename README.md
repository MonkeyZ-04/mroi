# MROI (Multiple Region of Interest)

A comprehensive system for managing multiple regions of interest in video surveillance cameras, consisting of a React-vite frontend and Node.js backend.

![MROI Screenshot](./docs/screenshot.png)

## Project Overview

This repository contains two main components:
- **mroi_app**: Frontend React application
- **mroi_server**: Backend Node.js server

## Features

### Frontend (mroi_app)
- Interactive ROI drawing interface
- Multiple ROI types support:
  - Intrusion detection
  - Tripwire monitoring
  - Density analysis
  - Zoom regions
- Real-time camera snapshot viewing
- Flexible scheduling system
- Responsive design

### Backend (mroi_server)
- RTSP stream handling
- Snapshot generation
- Multi-workspace support
- PostgreSQL database integration
- RESTful API endpoints

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mroi.git
cd mroi
```

2. Install and start the backend:
```bash
cd mroi_server
npm install
npm run dev
```

3. Install and start the frontend:
```bash
cd ../mroi_app
npm install
npm run dev
```

## Prerequisites

### Frontend Requirements
- Node.js 16.x or higher
- npm 8.x or higher
- Modern web browser

### Backend Requirements
- Node.js 16.x or higher
- npm 8.x or higher
- FFmpeg
- PostgreSQL database
- Python 3.x (for AI processing)

## Documentation

- [Frontend Documentation](./mroi_app/README.md)
- [Backend Documentation](./mroi_server/README.md)

## Project Structure

```
mroi/
├── mroi_app/           # Frontend application
│   ├── src/           # Source code
│   ├── public/        # Static files
│   └── package.json   # Dependencies
├── mroi_server/       # Backend server
│   ├── server/       # Server source code
│   ├── config/       # Configuration
│   └── package.json  # Dependencies
└── docs/             # Documentation
```

## Environment Setup

1. Backend (.env):
```env
PORT=3001
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

- @PrasitPaisan