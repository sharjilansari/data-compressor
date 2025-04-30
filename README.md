# Data Compression System

A modern web application for efficient data compression in backbone networks with blockchain integration.

## Technology Stack

### Frontend
- React with TypeScript
- Material-UI (MUI) for UI components
- React Router for navigation
- Context API for state management

### Backend
- Node.js with Express
- MongoDB for database
- JWT for authentication
- Sharp for image compression
- Web3.js for blockchain integration

## Features

- User authentication with JWT and Google OAuth
- File upload and compression
- Image optimization using Sharp
- Dark/Light theme support
- Real-time compression statistics
- Blockchain integration for data integrity
- Responsive design

## Project Structure

```
data-compression/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # Context providers
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── public/            # Static files
│
└── backend/               # Node.js backend application
    ├── src/
    │   ├── routes/        # API routes
    │   ├── controllers/   # Route controllers
    │   ├── models/        # Database models
    │   ├── services/      # Business logic
    │   └── utils/         # Utility functions
    └── logs/              # Application logs
```

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/sharjilansari/data-compressor.git
cd data-compressor
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables:
- Create `.env` file in the backend directory
- Add necessary environment variables (MongoDB URI, JWT secret, etc.)

4. Run the application:
```bash
# Start backend server
cd backend
npm run dev

# Start frontend development server
cd frontend
npm run dev
```

## Environment Variables

### Backend
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
PORT=5000
NODE_ENV=development
```

### Frontend
```
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 