# MROI Server

Backend service for the MROI (Multiple Region of Interest) application that handles camera streams, ROI management, and data processing.

## Features

- RTSP stream handling with FFmpeg
- Real-time snapshot generation
- ROI data management
- Multi-workspace support
- Database integration
- Error handling and logging
- Support for multiple ROI types:
  - Intrusion detection
  - Tripwire monitoring
  - Density analysis
  - Zoom regions

## Prerequisites

- Node.js 16.x or higher
- npm 8.x or higher
- FFmpeg installed on the system
- PostgreSQL database
- Python 3.x (for AI processing)

## Installation

1. Install FFmpeg (on macOS):
```bash
brew install ffmpeg
```

2. Clone the repository:
```bash
git clone https://github.com/PrasitPaisan/mroi.git
cd mroi/mroi_server
```

3. Install dependencies:
```bash
npm install
```

4. Rebuild bcrypt (if needed):
```bash
npm rebuild bcrypt
```

5. Create `.env` file:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=mroi_db
```

## Development

Start the development server with hot reload:
```bash
npm run dev
```

## Project Structure

```
mroi_server/
├── server/
│   ├── controllers/    # Request handlers
│   ├── services/       # Business logic
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   └── utils/          # Helper functions
├── config/             # Configuration files
├── tests/              # Test files
└── app.js             # Application entry point
```

## API Endpoints

### Camera Management
- `GET /snapshot` - Capture RTSP stream snapshot
- `GET /schemas/:SchemaSite` - Get cameras data for specific site

### ROI Management
- `GET /schemas` - Get available workspaces/schemas
- `GET /fetch/roi/data` - Get ROI configuration data
- `POST /save-region-config` - Save and update ROI configuration

| Variable    | Description           | Default     |
|-------------|--------------------|-------------|
| PORT        | Server port number | 5000        |
| DB_HOST     | Database host      | localhost   |
| DB_PORT     | Database port      | 5432        |
| DB_USER     | Database username  | -           |
| DB_PASSWORD | Database password  | -           |
| DB_NAME     | Database name      | mroi_db     |


## Scripts

- `npm run dev` - Start development server with hot reload
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run linter

