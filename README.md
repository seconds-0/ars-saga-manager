# Ars Saga Manager

## Quick Start Guide

### Prerequisites

- Node.js (v16 or higher)
- Docker Desktop
- PostgreSQL (v14 or higher)
- Git

### Initial Setup

1. Clone the repository:

```bash
git clone [your-repository-url]
cd ars-saga-manager
```

2. Install dependencies:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:

```bash
# In the backend directory
cp .env.example .env
# Edit .env with your database credentials and other settings
```

### Starting the Application

1. **Start the Database** (if using local PostgreSQL):

   - Ensure PostgreSQL service is running
   - Database should be configured according to your .env file

2. **Start the Backend Server**:

```bash
cd backend
npm run dev
```

3. **Start the Frontend Development Server**:

```bash
cd frontend
npm start
```

4. **Start the Logging Stack** (optional but recommended):

```bash
# From the project root
docker-compose up -d
```

### Ports & URLs

Each service runs on a specific port to avoid conflicts:

```
Frontend:  http://localhost:3000  (React development server)
Backend:   http://localhost:3001  (Express API server)
Grafana:   http://localhost:3200  (Logging & monitoring dashboard)
Loki:      http://localhost:3100  (Log aggregation service)
```

Note: Grafana runs on port 3000 inside its container but is mapped to port 3200 on your host machine to avoid conflicts with the frontend development server.

### Important Environment Variables

Backend (.env):

```env
# Database
DB_NAME=your_database_name
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

# JWT
JWT_SECRET=your_jwt_secret

# Server
PORT=3001
NODE_ENV=development
```

### Monitoring & Logging

The application uses a modern logging stack:

1. **View Application Logs**:

   - Development logs appear in the console
   - Structured logs are available in Grafana
   - Logs are aggregated by Loki
   - Promtail automatically collects and forwards logs

2. **Access Grafana Dashboard**:

   - Open http://localhost:3200
   - No login required in development mode (anonymous access enabled)
   - View the "Backend Monitoring" dashboard
   - Monitor error rates, recent errors, and system health

3. **Dashboard Features**:

   - Error Rate Panel: Shows error frequency over time
   - Recent Errors Panel: Displays latest error logs
   - Errors in Last Hour: Quick gauge of system health
   - Real-time updates every 5 seconds

4. **Log Levels**:
   - ERROR: Application errors and exceptions
   - WARN: Important warnings that need attention
   - INFO: General application events
   - DEBUG: Detailed information for debugging (development only)

### Common Commands

```bash
# Backend
npm run dev           # Start development server
npm test             # Run tests
npm start            # Start production server

# Frontend
npm start            # Start development server (port 3000)
npm test            # Run tests
npm run build       # Create production build

# Logging Stack
npm run start:logs   # Start logging stack (Grafana, Loki, Promtail)
npm run stop:logs    # Stop logging stack
docker-compose -f docker/docker-compose.yml logs  # View logging stack logs

# All Services
npm run start:all    # Start everything (frontend, backend, logging)
npm run stop:all     # Stop everything gracefully
npm run health       # Check health of all services
```

### Helper Scripts

We provide several helper scripts to make development easier:

```bash
# Initial setup
npm run setup         # Sets up development environment
npm run install:all   # Installs all dependencies

# Starting and stopping the application
npm run start:all     # Starts everything (logs, backend, frontend)
npm run stop:all      # Stops everything gracefully
npm run start:backend # Starts only the backend
npm run start:frontend # Starts only the frontend
npm run start:logs    # Starts only the logging stack
npm run stop:logs     # Stops the logging stack

# Monitoring
npm run health        # Checks health of all services

# Testing
npm run test:all     # Runs all tests (backend and frontend)
```

### Directory Structure

```
ars-saga-manager/
├── backend/                # Backend API server
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   ├── tests/             # Backend tests
│   └── utils/             # Utility functions
├── docs/                  # Project documentation
│   ├── architecture/      # Architecture diagrams
│   ├── development/       # Development guidelines
│   ├── plans/             # Feature plans
│   ├── system/            # System configuration
│   └── testing/           # Testing strategies
├── docker/                # Docker configuration
│   ├── logging/           # Logging configuration
│   └── docker-compose.yml # Main Docker composition
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── __test-utils__/ # Frontend test utilities
│   │   └── utils/        # Utility functions
├── scripts/               # Helper scripts
└── test-utils/            # Testing utilities
```

### Troubleshooting

1. **Port Conflicts**:

   - Frontend needs port 3000
   - Backend needs port 3001
   - Grafana uses port 3200 (mapped from internal 3000)
   - Loki needs port 3100

   **Common Port Conflict: Grafana Windows Service**
   If you have Grafana Enterprise installed as a Windows service, it may conflict with our setup by occupying port 3000. To resolve this:

   - Option 1: Using PowerShell (as Administrator):
     ```powershell
     Stop-Service Grafana
     ```
   - Option 2: Using Windows Services:
     1. Open Services (Win + R, type `services.msc`)
     2. Find "Grafana" in the list
     3. Right-click and select "Stop"
     4. (Optional) Set "Startup Type" to "Manual" to prevent auto-start

   **Other Port Conflicts**
   If any service fails to start, check for port conflicts:

   ```bash
   # Windows (PowerShell Admin):
   netstat -ano | findstr :<PORT>
   # Example: netstat -ano | findstr :3000
   ```

2. **Logging Issues**:

   - Ensure Docker is running
   - Check if all containers are up: `docker ps`
   - View container logs: `docker-compose logs [service]`
   - Verify Loki is receiving logs: Check Grafana's Explore section

3. **Common Solutions**:
   - Restart Docker Desktop if containers won't start
   - Clear Docker volumes if logs aren't appearing
   - Run `npm run stop:logs` then `npm run start:logs` to reset logging stack

### Development Workflow

1. Start the backend server
2. Start the frontend development server
3. (Optional) Start the logging stack
4. Make changes to the code
5. Check Grafana for logs and monitoring

### Additional Resources

- [Pino Logger Documentation](https://getpino.io/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Loki Documentation](https://grafana.com/docs/loki/latest/)

### Security Notes

- Never commit .env files
- Keep JWT_SECRET secure and unique
- Use strong database passwords
- Review logs for sensitive information

Need help? Create an issue in the repository or contact the development team.
