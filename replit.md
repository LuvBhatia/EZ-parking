# Smart Parking System

## Overview

This is a full-stack Smart Parking System built with React (frontend) and Express.js (backend). The application allows users to find and book parking spots, enables parking owners to manage their slots, and provides admin functionality for system oversight. The system includes **real-time notifications**, **Stripe payment processing in Indian Rupees**, and role-based authentication using JWT.

## Recent Changes (August 22, 2025)

- ✅ **Integrated Stripe Payment Processing**: Real payment processing for booking transactions in Indian Rupees (₹)
- ✅ **Added Real-time Notifications**: Socket.IO integration for instant updates on booking approvals, owner applications, and system events
- ✅ **Enhanced JWT Authentication**: Custom authentication system without third-party dependencies
- ✅ **Fixed Database Integration**: Proper Neon PostgreSQL setup with Drizzle ORM
- ✅ **Indian Localization**: All pricing and payments in Indian Rupees with GST calculation

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: React Context for authentication, TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Real-time Updates**: Socket.IO client for instant notifications

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect (Neon serverless)
- **Authentication**: JWT-based authentication with bcryptjs for password hashing
- **API Design**: RESTful endpoints with role-based access control
- **Error Handling**: Centralized error handling middleware
- **Real-time Communication**: Socket.IO server for notification broadcasting
- **Payment Processing**: Stripe integration with Indian Rupees support

### Database Schema
- **Users Table**: Stores user credentials, role information (user, owner, admin), and Stripe customer IDs
- **Owners Table**: Additional information for parking lot owners requiring admin approval
- **Parking Slots Table**: Details about parking spaces including location, type, and pricing in ₹
- **Bookings Table**: Records of parking reservations with status tracking and payment integration
- **Notifications Table**: System notifications for users with real-time delivery

### Authentication & Authorization
- **JWT Tokens**: Used for stateless authentication with 7-day expiration
- **Role-based Access**: Three distinct roles (user, owner, admin) with different permissions
- **Protected Routes**: Frontend route protection based on user roles
- **Password Security**: bcryptjs hashing with salt rounds for secure password storage

### Payment Integration
- **Stripe Integration**: Full payment processing for booking transactions
- **Indian Currency**: All payments processed in Indian Rupees (₹)
- **Payment Flow**: Create payment intent → process payment → update booking status
- **Fee Structure**: Base price + 10% service fee + 18% GST (as per Indian standards)
- **Security**: Server-side payment verification and secure API key management

### Real-time Features
- **Socket.IO Integration**: Bidirectional real-time communication
- **Instant Notifications**: Live updates for booking approvals, rejections, and owner applications
- **User Rooms**: Socket rooms for targeted notification delivery
- **Fallback Polling**: 30-second polling as backup for real-time updates

## External Dependencies

### Core Infrastructure
- **Database**: PostgreSQL (Neon Database serverless) with connection pooling
- **Payment Processing**: Stripe API with Indian market configuration
- **Real-time Communication**: Socket.IO for WebSocket connections

### Development & Deployment
- **Build System**: Vite for frontend bundling, esbuild for backend compilation
- **Development Tools**: Replit-specific plugins for development environment
- **Database Management**: Drizzle Kit for schema migrations and database operations

### Third-party Libraries
- **UI Components**: Extensive Radix UI component library
- **Validation**: Zod for schema validation
- **Date Handling**: React Day Picker for calendar functionality
- **Charts**: Recharts for analytics visualization
- **Icons**: Lucide React for consistent iconography

## Environment Variables

- **Database**: `DATABASE_URL` and related Postgres variables
- **Stripe**: `STRIPE_SECRET_KEY` and `VITE_STRIPE_PUBLIC_KEY` for payment processing
- **JWT**: Uses default secret key (configurable via `JWT_SECRET`)

## Key Features Implemented

### For Users (Car Owners)
- ✅ Account registration and JWT-based authentication
- ✅ Real-time parking slot search with filters (city, vehicle type)
- ✅ Slot booking with time duration selection
- ✅ Integrated Stripe payment processing in ₹
- ✅ Real-time booking status notifications
- ✅ Payment history and booking management

### For Owners (Parking Space Owners)
- ✅ Owner application system with admin approval
- ✅ Parking slot management (add, edit, pricing in ₹)
- ✅ Real-time booking request notifications
- ✅ Approve/reject booking requests
- ✅ Revenue tracking and analytics dashboard

### For Admins
- ✅ System overview with real-time statistics
- ✅ Owner application approval system
- ✅ User and owner management
- ✅ System activity monitoring
- ✅ Revenue and booking analytics

### Technical Features
- ✅ **Real-time Notifications**: Socket.IO for instant updates
- ✅ **Stripe Payment Integration**: Secure payment processing in ₹
- ✅ **JWT Authentication**: Custom token-based authentication
- ✅ **Role-based Access Control**: Three-tier user system
- ✅ **Responsive Design**: Mobile-first UI design
- ✅ **Indian Localization**: Currency, GST, and local city support