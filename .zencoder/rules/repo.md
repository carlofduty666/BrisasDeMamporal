---
description: Repository Information Overview
alwaysApply: true
---

# Brisas de Mamporal Information

## Summary
A comprehensive school management system for "Brisas de Mamporal" educational institution. The system handles academic management, student enrollment, grades, payments, and administrative tasks through a web-based interface. Recently implemented a reusable payment management component for streamlined payment processing.

## Structure
The repository is organized as a full-stack application with separate frontend and backend directories:

- **frontend/**: React application built with Vite
- **backend/**: Express.js API server with Sequelize ORM
- **.vscode/**: VS Code configuration
- **.zencoder/**: Zencoder configuration

## Projects

### Frontend (React Application)
**Configuration File**: package.json

#### Language & Runtime
**Language**: JavaScript (React)
**Version**: React 19.0.0
**Build System**: Vite 6.2.0
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- react: ^19.0.0
- react-dom: ^19.0.0
- react-router-dom: ^7.4.0
- axios: ^1.8.4
- react-hook-form: ^7.54.2
- tailwindcss: ^3.4.17
- @headlessui/react: ^2.2.0
- jwt-decode: ^4.0.0
- react-toastify: ^11.0.5
- @react-pdf/renderer: ^4.3.0

#### Build & Installation
```bash
cd frontend
npm install
npm run dev    # Development server
npm run build  # Production build
```

### Backend (Express.js API)
**Configuration File**: package.json

#### Language & Runtime
**Language**: JavaScript (Node.js)
**Framework**: Express.js 4.21.2
**Database**: MySQL with Sequelize ORM
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- express: ^4.21.2
- sequelize: ^6.37.6
- mysql2: ^3.13.0
- jsonwebtoken: ^9.0.2
- bcryptjs: ^3.0.2
- cors: ^2.8.5
- dotenv: ^16.4.7
- express-fileupload: ^1.5.1
- nodemailer: ^6.10.0
- multer: ^1.4.5-lts.1
- jspdf: ^3.0.1
- socket.io: ^4.8.1

#### Database Configuration
**Type**: MySQL
**Development Configuration**:
- Database: brisasdemamporaldb
- Host: 127.0.0.1
- Dialect: mysql

#### Server Setup
```bash
cd backend
npm install
node server.js  # Start the server
```

## Application Features

### Authentication System
- User registration with email verification
- Role-based access control (representante, profesor, adminWeb, owner)
- Password reset functionality

### Academic Management
- Grade and section management
- Subject administration
- Schedule management
- Student enrollment
- Academic calendar

### Student Management
- Student profiles and details
- Parent/guardian management
- Attendance tracking
- Grade recording and reporting

### Financial Management
- Fee configuration
- Payment processing with reusable payment component
- Monthly payment tracking with dual currency (USD/VES)
- Payment receipt uploads and verification
- Payment reports and status tracking

### Administrative Features
- Staff management
- System configuration
- Academic year setup
- Reporting tools

## Frontend Structure
- **src/components/**: UI components organized by feature
  - **src/components/pagos/**: Payment management components
  - **src/components/dashboard/**: Dashboard components for different user types
- **src/routes/**: Route definitions and protected routes
- **src/services/**: API service integrations
- **src/context/**: React context providers
- **src/pages/**: Page components including PagosPage for payment management
- **src/hooks/**: Custom React hooks
- **src/utils/**: Utility functions

## Backend Structure
- **models/**: Sequelize data models
- **controllers/**: Request handlers
- **routes/**: API endpoint definitions
- **middleware/**: Express middleware
- **config/**: Configuration files
- **migrations/**: Database migrations
- **seeders/**: Seed data
- **uploads/**: File storage for uploaded documents