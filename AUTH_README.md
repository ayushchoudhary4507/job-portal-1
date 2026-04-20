# Job Portal - Authentication System

## Overview
Complete authentication and authorization system with JWT-based token authentication, bcrypt password hashing, and role-based access control.

## Features Implemented

### Backend (Node.js/Express)
1. **JWT Authentication Middleware** (`backend/middleware/auth.js`)
   - `authenticate`: Verifies JWT tokens from Authorization header
   - `authorize`: Role-based access control middleware
   - Handles token expiration and invalid tokens

2. **Input Validation** (`backend/middleware/validation.js`)
   - `registerValidation`: Validates name, email, password strength, role, phone
   - `loginValidation`: Validates email and password
   - Password requirements: 6+ chars, uppercase, lowercase, number

3. **Protected Routes** (`backend/routes/jobApplications.js`)
   - All job application routes now require authentication
   - Role-based access:
     - Admin: Full access (view, create, update, delete)
     - Employer: View, update, stats access
     - Jobseeker: Create applications only

4. **Auth Routes** (`backend/routes/auth.js`)
   - `POST /api/auth/register` - User registration with validation
   - `POST /api/auth/login` - User login with validation
   - `GET /api/auth/me` - Get current authenticated user

### Frontend (React)
1. **AuthContext** (`frontend/src/context/AuthContext.jsx`)
   - Global authentication state management
   - Token storage in localStorage
   - Auto-login on app load
   - Methods: `login()`, `register()`, `logout()`, `hasRole()`

2. **Login Component** (`frontend/src/components/Login.jsx`)
   - Form validation
   - Error handling
   - Redirect to dashboard on success
   - "Remember me" option

3. **Register Component** (`frontend/src/components/Register.jsx`)
   - Full registration form with role selection
   - Password strength validation
   - Confirm password matching
   - Phone number validation

4. **ProtectedRoute Component** (`frontend/src/components/ProtectedRoute.jsx`)
   - Guards protected routes
   - Redirects unauthenticated users to login
   - Role-based access control

5. **Dashboard Component** (`frontend/src/components/Dashboard.jsx`)
   - Role-specific welcome message
   - Displays JobApplications for admin/employer
   - Shows job seeker dashboard cards

6. **Updated Sidebar** (`frontend/src/components/Sidebar.jsx`)
   - User profile section with avatar
   - Role-based navigation
   - Logout functionality
   - Profile dropdown menu

## File Structure

```
backend/
├── middleware/
│   ├── auth.js              # JWT verification & authorization
│   └── validation.js        # Input validation rules
├── routes/
│   ├── auth.js              # Authentication endpoints
│   └── jobApplications.js   # Protected job application routes
├── models/
│   └── User.js              # User model with bcrypt hashing
└── server.js                # Express server configuration

frontend/
├── src/
│   ├── context/
│   │   └── AuthContext.jsx  # Authentication state management
│   ├── components/
│   │   ├── Login.jsx         # Login form
│   │   ├── Register.jsx      # Registration form
│   │   ├── Auth.css          # Authentication styles
│   │   ├── Dashboard.jsx     # Main dashboard
│   │   ├── Dashboard.css     # Dashboard styles
│   │   ├── ProtectedRoute.jsx # Route guard
│   │   ├── Sidebar.jsx       # Updated with user info
│   │   └── Sidebar.css       # Updated sidebar styles
│   └── App.jsx               # Updated with routing
└── package.json              # Added react-router-dom
```

## API Endpoints

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/auth/register | Register new user | Public |
| POST | /api/auth/login | Login user | Public |
| GET | /api/auth/me | Get current user | Authenticated |

### Job Applications
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | /api/job-applications | Get all applications | admin, employer |
| GET | /api/job-applications/stats/overview | Get stats | admin, employer |
| GET | /api/job-applications/:id | Get single application | admin, employer, jobseeker |
| POST | /api/job-applications | Create application | jobseeker, admin |
| PUT | /api/job-applications/:id | Update application | admin, employer |
| DELETE | /api/job-applications/:id | Delete application | admin |

## User Roles
- `jobseeker` - Can create job applications, view own applications
- `employer` - Can view all applications, update status, view stats
- `admin` - Full access to all operations

## Security Features
1. **Password Security**
   - Bcrypt hashing with salt rounds (10)
   - Minimum password requirements enforced
   - Passwords never stored in plain text

2. **JWT Tokens**
   - 7-day expiration
   - Secure storage in localStorage
   - Automatic token validation on API requests
   - Token blacklist on logout

3. **Authorization**
   - Role-based access control on all sensitive routes
   - Middleware protection for API endpoints
   - Frontend route guards

## Environment Variables

### Backend (.env)
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Running the Application

### Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### Start Development
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

## Usage Flow

1. **Registration**
   - Navigate to `/register`
   - Fill in name, email, password, role, phone
   - Password must be 6+ chars with uppercase, lowercase, number
   - On success, automatically logged in and redirected to dashboard

2. **Login**
   - Navigate to `/login`
   - Enter email and password
   - On success, redirected to dashboard
   - Token stored in localStorage for persistence

3. **Dashboard Access**
   - Authenticated users see role-specific content
   - Admin/Employer: Job Applications management
   - Jobseeker: Application tracking and profile cards

4. **Logout**
   - Click user profile in sidebar
   - Select "Logout"
   - Token removed, redirected to login

## Testing Credentials
Create test users through the registration page with different roles to test access control.
