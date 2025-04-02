# Ars Saga Manager System Architecture

The Ars Saga Manager is a web-based application designed for managing characters in the Ars Magica 5th edition role-playing game. It follows a client-server architecture with a React frontend and a Node.js/Express backend, implementing a three-tier architecture: presentation layer, application layer, and data layer.

## 1. Frontend (Presentation Layer)
- Built with React, utilizing modern JavaScript features
- Uses React Router for client-side routing
- Implements a responsive design with Tailwind CSS for styling
- Communicates with the backend via RESTful API calls using Axios
- Utilizes React Query for efficient data fetching and caching
- Implements custom hooks for form handling and authentication
- Key components:
  - Authentication system (login, registration, password reset)
  - Character management (creation, listing, editing)
  - Character sheet with multiple tabs for different aspects of characters
  - Error handling and display components
  - Modal and Toast components for user feedback

## 2. Backend (Application Layer)
- Node.js with Express.js framework
- RESTful API endpoints for user authentication and character management
- JWT (JSON Web Token) for secure authentication
- Sequelize ORM for database interactions
- Middleware for rate limiting, input sanitization, and validation
- Key features:
  - User authentication and authorization with detailed password reset functionality
  - Character CRUD operations with validation and error handling
  - Simulated email service for password reset (for development)
  - Caching mechanism for improved performance
  - Custom error handling and logging

## 3. Database (Data Layer)
- PostgreSQL database
- Managed through Sequelize ORM
- Complex database configuration with different roles (superuser, developer, and app user)
- Tables: users, characters, reference_virtues_flaws, character_virtues_flaws
- Comprehensive migration system for database schema management
- Seeding scripts for initial data population (e.g., virtues and flaws)

## 4. Development and Deployment
- Uses environment variables for configuration
- Implements comprehensive migrations for database schema management
- Includes seeding scripts for initial data population
- Custom scripts for generating and updating documentation

## 5. Security Measures
- Password hashing using bcrypt
- JWT for secure authentication
- CORS enabled for cross-origin resource sharing
- Input sanitization and validation
- Rate limiting to prevent abuse

## 6. Architecture Patterns
- MVC (Model-View-Controller) pattern in the backend
- Component-based architecture in the React frontend
- Separation of concerns between frontend and backend
- Use of middleware for authentication, error handling, and request processing

## 7. API Design
- RESTful API design principles
- JSON data format for request and response bodies
- Detailed error handling and validation in API endpoints

## 8. State Management
- React's built-in state management (useState, useEffect hooks)
- Custom authentication hook (useAuth) for managing user sessions
- React Query for server state management

## 9. File Structure
- Clear separation between frontend and backend
- Modular organization of components, routes, and utilities
- Dedicated directories for configuration, middleware, and database operations

## 10. Testing and Quality Assurance
- Jest setup for frontend testing
- Error boundary implementation for graceful error handling in the UI

## 11. Additional Features
- Custom rule engine for character creation and management
- Comprehensive character sheet with multiple tabs (Arts, Characteristics, Abilities, Virtues/Flaws, Spells, Equipment)
- Dynamic virtue and flaw selection system

This architecture provides a scalable and maintainable structure for the Ars Saga Manager application, allowing for efficient management of Ars Magica 5th edition character data and easy expansion of features.