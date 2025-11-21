# Overview

KeepLeads is a comprehensive lead management and sales platform specifically designed for health insurance leads in the Brazilian market. The application allows businesses to capture, manage, and sell qualified leads through a modern web interface. It integrates with external services like KommoCRM for lead data and provides a complete marketplace where clients can purchase leads using a credit-based system with Mercado Pago integration for payments.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client is built using React with TypeScript, leveraging a modern component-based architecture. The UI is constructed with shadcn/ui components built on Radix UI primitives, providing accessible and customizable interface elements. TailwindCSS handles styling with a comprehensive design system including dark mode support and custom CSS variables for theming.

The application uses Wouter for client-side routing, providing a lightweight alternative to React Router. State management is handled through TanStack Query (React Query) for server state and React's built-in state management for local component state. The routing structure separates authenticated and unauthenticated flows, with protected routes for the main application features.

## Backend Architecture
The server is built on Express.js with TypeScript, following a modular architecture pattern. The API layer is organized around RESTful endpoints with proper middleware for authentication, logging, and error handling. The application uses a layered architecture with clear separation between routes, business logic, and data access layers.

Authentication is implemented using Replit's OpenID Connect integration with Passport.js, providing secure session management with PostgreSQL-backed session storage. The authentication system supports role-based access control with admin and client user types.

## Data Storage Architecture
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The database schema is well-structured with proper relationships between users, leads, insurance companies, purchases, and credit transactions. Drizzle provides migration support and ensures type safety between the database schema and application code.

The data layer includes comprehensive models for:
- User management with role-based permissions and status tracking (active/suspended)
- Lead storage with detailed metadata and filtering capabilities
- Purchase tracking and transaction history
- Credit system for lead purchases
- Insurance company categorization

### User Management Features (November 2025)
The admin panel includes comprehensive user management capabilities:
- **User Status System**: Users can be marked as "active" or "suspended"
- **Edit User Details**: Admins can update user information (name, email, role, credits)
- **Status Toggle**: Quick suspend/activate functionality with visual badge indicators
- **Security Protections**: 
  - Admins cannot change their own role to non-admin
  - Admins cannot suspend themselves
  - Password field properly validates: required for new users, optional for edits
- **Form Validation**: Password accepts minimum 6 characters, empty string, or undefined for flexibility during edits

## Development and Build System
The project uses Vite as the build tool for the frontend, providing fast development server and optimized production builds. The backend uses esbuild for server-side bundling. TypeScript is configured with path mapping for clean imports and proper type checking across the entire codebase.

The development setup includes hot module replacement for the frontend and automatic server restart for backend changes. The build process creates optimized bundles for both client and server code.

# External Dependencies

## Database Service
- **Neon Database**: PostgreSQL-compatible serverless database service
- **Connection**: Uses connection pooling with `@neondatabase/serverless`
- **Purpose**: Primary data storage for all application data

## Payment Processing
- **Mercado Pago**: Brazilian payment gateway integration
- **Implementation**: Credit purchase system for lead transactions
- **Features**: Supports multiple payment methods including credit cards

## Authentication Provider
- **Replit Auth**: OpenID Connect authentication service
- **Session Management**: PostgreSQL-backed sessions with `connect-pg-simple`
- **Security**: Secure session handling with proper cookie configuration

## External CRM Integration
- **KommoCRM**: Lead data source integration
- **Integration Method**: Webhook/API integration (configured for future implementation)
- **Data Flow**: Automated lead import from external marketing campaigns

## UI Component Library
- **Radix UI**: Headless component primitives for accessibility
- **shadcn/ui**: Pre-built component library built on Radix
- **Styling**: TailwindCSS for utility-first styling approach

## Development Tools
- **Vite**: Frontend build tool and development server
- **Drizzle Kit**: Database migration and schema management
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Server-side bundling for production builds