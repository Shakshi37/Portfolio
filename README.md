# Portfolio Management System

A full-stack application for managing a professional portfolio with authentication, certificate management, and experience tracking.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [Frontend Components](#frontend-components)
- [Database Schema](#database-schema)
- [Logging System](#logging-system)
- [Troubleshooting](#troubleshooting)

## Overview

This project is a portfolio management system that allows users to:
- Create and manage their professional profile
- Track certificates and qualifications
- Record work experiences
- Manage authentication with secure token-based login

## Features

- **User Authentication**: Secure login with JWT tokens and refresh mechanism
- **Certificate Management**: Add, edit, and delete professional certificates
- **Experience Tracking**: Record and manage work experiences
- **Admin Dashboard**: Administrative interface for user management
- **Responsive Design**: Works on desktop and mobile devices
- **Comprehensive Logging**: Detailed logging of all operations for debugging and monitoring

## Tech Stack

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Cookie-based session management
- Winston for logging

### Frontend
- React with TypeScript
- Vite for build tooling
- Axios for API requests
- React Router for navigation

## Project Structure

```
project/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service functions
│   │   └── types/          # TypeScript type definitions
│   └── package.json
├── server/                 # Backend Node.js application
│   ├── models/             # Mongoose models
│   ├── routes/             # Express routes
│   ├── middleware/         # Express middleware
│   ├── utils/              # Utility functions
│   │   └── logger.js       # Winston logger configuration
│   └── index.js            # Server entry point
├── logs/                   # Log files directory
│   ├── error.log           # Error logs
│   └── combined.log        # All logs
└── package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd portfolio-management
   ```

2. Install dependencies:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. Set up environment variables (see [Environment Variables](#environment-variables))

4. Start the development servers:
   ```bash
   # Start the backend server
   cd server
   npm run dev

   # Start the frontend development server
   cd ../client
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/portfolio
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_token_secret
ADMIN_SECRET=your_admin_secret_key
NODE_ENV=development
```

## API Documentation

### Authentication Endpoints

#### Register a New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_username",
    "password": "your_password",
    "adminSecret": "your_admin_secret"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_username",
    "password": "your_password"
  }'
```

#### Refresh Token
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json"
```

#### Logout
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Content-Type: application/json"
```

#### Check Authentication Status
```bash
curl -X GET http://localhost:5000/api/auth/status
```

#### Unlock Account (Admin Only)
```bash
curl -X POST http://localhost:5000/api/auth/unlock-account \
  -H "Content-Type: application/json" \
  -d '{
    "username": "locked_username",
    "adminSecret": "your_admin_secret"
  }'
```

### Certificate Endpoints

#### Get All Certificates
```bash
curl -X GET http://localhost:5000/api/certificates \
  -H "Authorization: Bearer your_access_token"
```

#### Create Certificate
```bash
curl -X POST http://localhost:5000/api/certificates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_access_token" \
  -d '{
    "title": "Certificate Title",
    "issuer": "Issuing Organization",
    "issueDate": "2023-01-01",
    "expiryDate": "2024-01-01",
    "credentialId": "CERT123",
    "credentialUrl": "https://example.com/verify/CERT123"
  }'
```

#### Update Certificate
```bash
curl -X PUT http://localhost:5000/api/certificates/:id \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_access_token" \
  -d '{
    "title": "Updated Certificate Title",
    "issuer": "Updated Issuing Organization"
  }'
```

#### Delete Certificate
```bash
curl -X DELETE http://localhost:5000/api/certificates/:id \
  -H "Authorization: Bearer your_access_token"
```

### Experience Endpoints

#### Get All Experiences
```bash
curl -X GET http://localhost:5000/api/experiences \
  -H "Authorization: Bearer your_access_token"
```

#### Create Experience
```bash
curl -X POST http://localhost:5000/api/experiences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_access_token" \
  -d '{
    "title": "Job Title",
    "company": "Company Name",
    "location": "Location",
    "startDate": "2022-01-01",
    "endDate": "2023-01-01",
    "current": false,
    "description": "Job description"
  }'
```

#### Update Experience
```bash
curl -X PUT http://localhost:5000/api/experiences/:id \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_access_token" \
  -d '{
    "title": "Updated Job Title",
    "company": "Updated Company Name"
  }'
```

#### Delete Experience
```bash
curl -X DELETE http://localhost:5000/api/experiences/:id \
  -H "Authorization: Bearer your_access_token"
```

## Authentication

The application uses JWT (JSON Web Tokens) for authentication with the following features:

- Access tokens (15 minutes validity)
- Refresh tokens (7 days validity)
- Secure HTTP-only cookies
- Account locking after multiple failed login attempts
- Token refresh mechanism

### Authentication Flow

1. User logs in with username and password
2. Server validates credentials and issues access and refresh tokens
3. Tokens are stored in HTTP-only cookies
4. Access token is used for API requests
5. When access token expires, refresh token is used to obtain a new access token
6. If refresh token is invalid or expired, user must log in again

## Frontend Components

### Login Component
- Handles user authentication
- Displays error messages for failed login attempts
- Manages token refresh

### Certificates Component
- Displays list of certificates
- Allows adding, editing, and deleting certificates
- Handles form validation

### Experiences Component
- Displays list of work experiences
- Allows adding, editing, and deleting experiences
- Handles form validation

## Database Schema

### User Model
```javascript
{
  username: String,
  password: String (hashed),
  isAdmin: Boolean,
  locked: Boolean,
  loginAttempts: Number,
  lockUntil: Date,
  refreshToken: String
}
```

### Certificate Model
```javascript
{
  title: String,
  issuer: String,
  issueDate: Date,
  expiryDate: Date,
  credentialId: String,
  credentialUrl: String,
  user: ObjectId (ref: 'User')
}
```

### Experience Model
```javascript
{
  title: String,
  company: String,
  location: String,
  startDate: Date,
  endDate: Date,
  current: Boolean,
  description: String,
  user: ObjectId (ref: 'User')
}
```

## Logging System

The application uses Winston for comprehensive logging with the following features:

### Log Levels
- **error**: For errors that need immediate attention
- **warn**: For potentially harmful situations
- **info**: For general operational information
- **debug**: For detailed information useful for debugging

### Log Destinations
- **Console**: All logs are output to the console with color coding
- **error.log**: Contains only error-level logs
- **combined.log**: Contains all logs

### Log Format
Logs include:
- Timestamp
- Log level
- Message
- Additional metadata (user IDs, request details, etc.)
- Stack traces for errors

### Route Logging
All API routes are automatically logged with:
- Request details (method, URL, parameters)
- Response status and timing
- User context when available

### Example Log Entries
```
2023-06-15 14:32:45 info: Login attempt: {"username":"john_doe"}
2023-06-15 14:32:45 info: Login successful: {"username":"john_doe","userId":"60d21b4667d0d8992e610c85"}
2023-06-15 14:33:12 info: Creating new certificate for user: {"userId":"60d21b4667d0d8992e610c85","certificateTitle":"AWS Certified Solutions Architect"}
2023-06-15 14:33:12 info: Certificate created successfully: {"userId":"60d21b4667d0d8992e610c85","certificateId":"60d21b4667d0d8992e610c86","title":"AWS Certified Solutions Architect"}
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check if cookies are enabled in your browser
   - Verify that the JWT_SECRET environment variable is set correctly
   - Check server logs for detailed error messages

2. **CORS Issues**
   - Ensure the frontend URL is included in the CORS configuration
   - Check that credentials are included in API requests

3. **Database Connection Issues**
   - Verify MongoDB is running
   - Check the MONGODB_URI environment variable

### Debugging Tools

1. **Authentication Status Check**
   ```bash
   curl -X GET http://localhost:5000/api/auth/status
   ```

2. **Server Logs**
   - Check server console for detailed error messages
   - Look for authentication-related logs
   - Review the log files in the `logs` directory

3. **Browser Developer Tools**
   - Check Network tab for API requests
   - Verify cookies are being set correctly

## License

This project is licensed under the MIT License - see the LICENSE file for details. 