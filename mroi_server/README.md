# MROI Server

Backend service for the MROI (Multiple Region of Interest) application that handles camera streams, ROI management, and data processing.

## Features

- RTSP stream handling with FFmpeg
- Real-time snapshot generation
- ROI data management
- Multi-workspace support
- Authentication and authorization
- Database integration

## Prerequisites

- Node.js 16.x or higher
- Yarn package manager
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
git clone https://github.com/yourusername/mroi.git
cd mroi/mroi_server
```

3. Install dependencies:
```bash
yarn install
```

4. Rebuild bcrypt (if needed):
```bash
npm rebuild bcrypt
```

5. Create `.env` file:
```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=mroi_db
JWT_SECRET=your_secret_key
```

## Development

Start the development server with hot reload:
```bash
yarn watch:dev
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
- `POST /stream/start` - Start stream processing
- `POST /stream/stop` - Stop stream processing

### ROI Management
- `GET /schemas` - Get available workspaces
- `GET /schemas/:name` - Get workspace data
- `POST /roi/save` - Save ROI configuration
- `GET /roi/data` - Get ROI data

## Environment Variables

| Variable    | Description           | Default     |
|-------------|--------------------|-------------|
| PORT        | Server port number | 3001        |
| DB_HOST     | Database host      | localhost   |
| DB_PORT     | Database port      | 5432        |
| DB_USER     | Database username  | -           |
| DB_PASSWORD | Database password  | -           |
| DB_NAME     | Database name      | mroi_db     |
| JWT_SECRET  | JWT secret key     | -           |

## Scripts

- `yarn watch:dev` - Start development server
- `yarn start` - Start production server
- `yarn test` - Run tests
- `yarn lint` - Run linter

## Error Handling

The server implements standardized error responses:

```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
