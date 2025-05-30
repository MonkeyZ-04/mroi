# MROI (Multiple Region of Interest)

A comprehensive system for managing multiple regions of interest in RTSP camera streams using React and Node.js.

## Features

### Frontend (mroi_app)
- Draw and manage multiple ROI types:
  - Intrusion detection zones
  - Tripwire lines
  - Density monitoring areas
  - Zoom regions (max 1 per camera)
- Real-time camera snapshot viewing
- Flexible scheduling system
- Support for RTSP camera streams
- Responsive design (desktop to mobile)
- Interactive drawing with Konva.js

### Backend (mroi_server)
- RTSP stream handling with FFmpeg
- Real-time snapshot generation
- Multi-workspace support
- PostgreSQL database integration
- RESTful API endpoints

## Prerequisites

### Frontend Requirements
- Node.js 16.x or higher
- npm 8.x or higher
- Modern web browser with WebGL support

### Backend Requirements
- Node.js 16.x or higher
- npm 8.x or higher
- FFmpeg 4.x or higher
- PostgreSQL 14.x or higher

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/metthier/mroi.git
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

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000/api

## Environment Setup

1. Backend (.env):
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=mroi_db
```

2. Frontend (.env):
```env
VITE_API_ENDPOINT=http://localhost:5000/api
VITE_CREATOR='METTHIER AI TEAMS'
VITE_MAX_TOTAL_REGION=6
VITE_MAX_ZOOM_REGION=1
```

## Project Structure

```
mroi/
├── mroi_app/           # Frontend application
│   ├── src/
│   │   ├── components/ # React components
│   │   │   ├── drawing_canvas.jsx
│   │   │   ├── setup_editor.jsx
│   │   │   ├── sidebar.jsx
│   │   │   └── tools.jsx
│   │   ├── styles/    # CSS styles
│   │   └── utils/     # Utility functions
│   └── package.json
├── mroi_server/       # Backend server
│   ├── server/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Authors

- [@PrasitPaisan](https://github.com/PrasitPaisan)
