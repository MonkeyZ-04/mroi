# MROI Application

A React-based application for managing multiple regions of interest (ROI) in video surveillance systems.

## Features

- Draw and manage multiple ROI types:
  - Intrusion detection zones
  - Tripwire lines
  - Density monitoring areas
  - Zoom regions
- Real-time camera snapshot viewing
- Flexible scheduling system
- Support for RTSP camera streams
- Responsive design for different screen sizes

## Prerequisites

- Node.js 16.x or higher
- npm 8.x or higher
- A modern web browser
- Access to RTSP camera streams

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mroi.git
cd mroi/mroi_app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_API_ENDPOINT=http://localhost:3001
VITE_CREATOR=your_name
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building for Production

Create a production build:
```bash
npm run build
```

## Project Structure

```
mroi_app/
├── src/
│   ├── components/    # React components
│   ├── styles/       # CSS files
│   ├── utils/        # Utility functions
│   └── App.jsx       # Main application component
├── public/           # Static files
└── package.json      # Project dependencies
```

## Key Components

- **DrawingCanvas**: Handles ROI drawing and visualization
- **SetupEditor**: Manages ROI configuration and scheduling
- **Sidebar**: Lists and manages ROI rules
- **Tools**: Main workspace for ROI management

## Environment Variables

- `VITE_API_ENDPOINT`: Backend API endpoint
- `VITE_CREATOR`: Default creator name for new rules

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
