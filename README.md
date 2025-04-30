# Data Compression System

A modern web application for efficient data compression in backbone networks with blockchain integration.

## Technology Stack

### Frontend
- React with TypeScript
- Material-UI (MUI) for UI components
- React Router for navigation
- Context API for state management
- Firebase Authentication

### Backend
- Node.js with Express
- MongoDB for database
- Firebase Admin SDK for authentication
- Sharp for image compression
- Web3.js for blockchain integration

## Features

- User authentication with Firebase (Email/Password and Google OAuth)
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
│   │   ├── contexts/      # Context providers (including AuthContext)
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

3. Set up Firebase:
- Create a Firebase project at https://console.firebase.google.com/
- Enable Authentication with Email/Password and Google providers
- Get your Firebase configuration

4. Set up environment variables:
- Create `.env` file in the backend directory
- Add necessary environment variables (MongoDB URI, Firebase config, etc.)

5. Run the application:
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
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
PORT=5000
NODE_ENV=development
```

### Frontend
```
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 