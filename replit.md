# Replit MD

## Overview

This is an Arabic educational platform called "مستر محمد السيد" (Mr. Mohammed El-Sayed) designed for students and teachers. The platform provides a comprehensive learning management system with features for content delivery, quiz management, and progress tracking. It's built as a full-stack web application with a React frontend and Express backend, specifically designed to be mobile-responsive for Arabic-speaking students.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on top of Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming and RTL (Right-to-Left) support for Arabic
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Session Management**: Express sessions for authentication
- **API Design**: RESTful API with role-based access control (student/admin)

### Database Design
- **Primary Database**: PostgreSQL (configured for Neon serverless)
- **Schema**: Comprehensive educational platform schema including:
  - Users table with role-based access (student/admin)
  - Materials table for educational content (whiteboard images, videos, documents)
  - Quizzes table with JSON-based question storage
  - Quiz attempts table for tracking student progress and scores
- **Migrations**: Drizzle Kit for database schema management

### Authentication & Authorization
- **Session-based Authentication**: Uses express-session with secure cookie storage
- **Role-based Access Control**: Separates student and admin functionality
- **Middleware Protection**: Route-level authentication and authorization middleware
- **User Management**: Registration with grade/group selection for content filtering

### Content Management System
- **Material Types**: Support for whiteboard images, YouTube videos, and documents
- **Content Organization**: Materials organized by grade level and student groups
- **Quiz System**: Interactive quizzes with multiple question types, time limits, and attempt tracking
- **Progress Tracking**: Comprehensive analytics for student performance and quiz statistics

### Mobile-First Design
- **Responsive Layout**: Tailwind CSS with mobile-first approach
- **RTL Support**: Full right-to-left layout support for Arabic content
- **Touch-Friendly UI**: Optimized for mobile interaction patterns
- **Progressive Enhancement**: Works across different device capabilities

## External Dependencies

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting (@neondatabase/serverless)
- **Drizzle ORM**: Type-safe database operations (drizzle-orm, drizzle-zod)

### UI & Design System
- **Radix UI**: Comprehensive set of accessible React components
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography
- **Font Awesome**: Additional icon support via CDN

### Frontend Libraries
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form management with validation
- **Zod**: Runtime type validation and schema definition
- **Date-fns**: Date manipulation with Arabic locale support
- **Wouter**: Lightweight client-side routing

### Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety and enhanced developer experience
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind integration

### Session & Security
- **Express Session**: Session management for authentication
- **Connect-pg-simple**: PostgreSQL session store for persistence
- **CORS**: Cross-origin resource sharing configuration

### Hosting & Deployment
- **Replit**: Development and hosting platform integration
- **Static Asset Hosting**: External hosting for educational materials (images, videos)