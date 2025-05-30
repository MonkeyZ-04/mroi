# MROI Application

A React-Vite application for managing multiple regions of interest (ROI) in video surveillance systems.

## Features

- Draw and manage multiple ROI types:
  - Intrusion detection zones (unlimited)
  - Tripwire lines (unlimited)
  - Density monitoring areas (unlimited)
  - Zoom regions (max 1 per camera)
  - Total regions limited to 6 per camera
- Real-time camera snapshot viewing with FFmpeg
- Flexible scheduling system with timezone support
- Support for RTSP camera streams
- Responsive design (desktop to mobile)
- Interactive drawing with Konva.js

## Prerequisites

- Node.js 16.x or higher
- npm 8.x or higher
- Modern web browser with WebGL support
- Access to RTSP camera streams
- Backend server running on port 3001

## Installation

1. Clone the repository:
```bash
git clone https://github.com/PrasitPaisan/mroi.git
cd mroi/mroi_app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_API_ENDPOINT=http://localhost:5000/api
VITE_CREATOR='METTHIER AI TEAMS'
VITE_MAX_TOTAL_REGION=6
VITE_MAX_ZOOM_REGION=1
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
mroi_app/
├── src/
│   ├── components/    # React components
│   │   ├── DrawingCanvas.jsx    # ROI drawing interface
│   │   ├── SetupEditor.jsx      # ROI configuration
│   │   ├── Sidebar.jsx          # Rule management
│   │   └── Tools.jsx            # Main workspace
│   ├── styles/       # CSS files
│   ├── utils/        # Utility functions
│   └── App.jsx       # Main application component
├── public/           # Static files
└── package.json      # Project dependencies
```

## Key Components

- **DrawingCanvas**: Handles ROI drawing and visualization using Konva.js
- **SetupEditor**: Manages ROI configuration, scheduling, and parameter settings
- **Sidebar**: Lists and manages ROI rules with real-time status updates
- **Tools**: Main workspace for ROI management and camera integration

## Environment Variables

- `VITE_API_ENDPOINT`: Backend API endpoint (default: http://localhost:5000/api)
- `VITE_CREATOR`: Default creator name (default: 'METTHIER AI TEAMS')
- `VITE_MAX_TOTAL_REGION`: Maximum total ROI regions allowed (default: 6)
- `VITE_MAX_ZOOM_REGION`: Maximum zoom regions per camera (default: 1)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally

## Usage Limits

- Maximum total ROI regions per camera: 6
- Maximum zoom regions per camera: 1
- No individual limits on other region types within total limit
