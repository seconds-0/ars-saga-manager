# Work Plan: Improve User Registration Error Handling (2025-02-06)

## Goal

Improve the user experience during registration by providing more informative error messages when an email address is already registered. Additionally, implement best practices for error logging to ensure cleaner and more maintainable logs, especially in a production environment.

## 1. Backend Changes: Handle Unique Email Constraint in Registration

**What:** Modify the `/register` route in `backend/routes/auth.js` to specifically handle the `SequelizeUniqueConstraintError` that occurs when a user attempts to register with an email address already present in the database.

**Why:** Currently, when a user registers with an existing email, the backend returns a generic 500 error and logs a noisy error to the console. This is not user-friendly and provides little information to the frontend to display a helpful error message. By specifically handling the `SequelizeUniqueConstraintError`, we can return a 400 status code with a clear, user-friendly message indicating that the email is already registered.

**Files Involved:**

- `backend/routes/auth.js`

**Action Steps:**

1.  **Locate the `/register` route:** Open `backend/routes/auth.js` and find the `router.post('/register', ...)` route handler. This is currently located between lines 36 and 45 of the provided code snippet.

    ```javascript:backend/routes/auth.js
    startLine: 36
    endLine: 45
    ```

2.  **Implement Error Handling for `SequelizeUniqueConstraintError`:** Modify the `try...catch` block in the `/register` route to check for `SequelizeUniqueConstraintError`. If this error occurs, return a 400 status code with a JSON response containing the message: `"An account is already registered under that email address."` For other errors, maintain the existing 500 error response and server-side logging.

    **Modified Code Snippet in `backend/routes/auth.js`:**

    ```javascript:backend/routes/auth.js
    startLine: 36
    endLine: 50
    ```

    ```diff
    --- a/backend/routes/auth.js
    +++ b/backend/routes/auth.js
    @@ -36,13 +36,17 @@
         const { email, password } = req.body;
         const hashedPassword = await bcrypt.hash(password, 10);
         await sequelize.models.User.create({ email, password: hashedPassword });
    ```

-        res.status(201).json({ message: 'User created successfully' });

*        return res.status(201).json({ message: 'User created successfully' });
       } catch (error) {

-        res.status(500).json({ message: 'Error creating user', error: error.message });

*        if (error.name === 'SequelizeUniqueConstraintError') {
*          // Email already exists
*          return res.status(400).json({ message: 'An account is already registered under that email address.' });
*        }
*        console.error('Error creating user:', error); // Keep detailed error logging on the server
*        return res.status(500).json({ message: 'Error creating user', error: error.message, stack: error.stack });
       }
  }

- });
-

* );
  // ... rest of the file

  ```

  ```

## 2. Frontend Changes: Display User-Friendly Error Message

**What:** Update the `RegisterForm` component in `frontend/src/components/RegisterForm.js` to handle the new 400 error response from the backend. When a 400 error with the specific message is received, display a user-friendly toast message indicating that the email is already registered.

**Why:** Without frontend changes, the user will still see a generic "Registration failed" message. We need to parse the specific 400 error response from the backend and display the more informative message to the user, improving the registration flow and user experience.

**Files Involved:**

- `frontend/src/components/RegisterForm.js`

**Action Steps:**

1.  **Locate the `handleRegister` function:** Open `frontend/src/components/RegisterForm.js` and find the `handleRegister` asynchronous function. This function handles the registration API call and is currently located between lines 15 and 38 of the provided code snippet.

    ```javascript:frontend/src/components/RegisterForm.js
    startLine: 15
    endLine: 38
    ```

2.  **Modify the `catch` block in `handleRegister`:** Update the `catch` block to check for a 400 status code in the error response. If the status code is 400 and the response data contains a `message` property, use this message to set the `toastMessage`. Otherwise, fallback to the generic error message.

    **Modified Code Snippet in `frontend/src/components/RegisterForm.js`:**

    ```javascript:frontend/src/components/RegisterForm.js
    startLine: 30
    endLine: 38
    ```

    ```diff
    --- a/frontend/src/components/RegisterForm.js
    +++ b/frontend/src/components/RegisterForm.js
    @@ -30,9 +30,13 @@
         onRegisterSuccess();
       }, 3000);
     } catch (error) {
    ```

-      console.error('Registration failed', error.response?.data || error.message);
-      setToastMessage('Registration failed: ' + (error.response?.data?.message || error.message));

*      console.error('Registration failed', error.response?.data || error.message); // Keep console logging for development
       setToastType('error');
*      if (error.response?.status === 400 && error.response.data?.message) {
*        setToastMessage('Registration failed: ' + error.response.data.message); // Use specific message from backend
*      } else {
*        setToastMessage('Registration failed: ' + (error.response?.data?.message || error.message)); // Fallback generic error
*      }

  }
  };

  ```

  ```

## 3. Implement Pino Logging and Grafana Loki Integration

**What:** Replace console logging with Pino for structured logging and set up Grafana Loki for log aggregation and visualization.

**Why:**

- Pino provides high-performance structured logging with JSON output
- Better log organization and searchability
- Easier debugging in production
- Grafana Loki offers powerful log visualization and querying

**Files Involved:**

- `backend/utils/logger.js` (new file for Pino setup)
- `backend/middleware/logging.js` (new file for logging middleware)
- `backend/server.js`
- `backend/routes/auth.js`
- `docker-compose.yml` (new file for Loki setup)

**Action Steps:**

1. **Set up Pino Logger:**

   - Create `backend/utils/logger.js` with Pino configuration
   - Configure log levels for different environments
   - Add request ID tracking
   - Set up pretty printing for development

2. **Create Logging Middleware:**

   - Create `backend/middleware/logging.js`
   - Implement request logging middleware
   - Add error logging middleware
   - Include contextual information (request ID, user info, etc.)

3. **Set up Grafana Loki:**

   - Create Docker Compose configuration for Loki and Grafana
   - Configure Loki data source in Grafana
   - Set up basic dashboards for:
     - Registration attempts (success/failure)
     - Error rates
     - Request latency

4. **Update Application Code:**

   - Replace all console.log/error calls with Pino logger
   - Add request logging middleware to Express app
   - Add error logging middleware
   - Add structured logging for important events

5. **Create Development Tools:**
   - Add npm scripts for log viewing
   - Create basic log querying examples
   - Document common log queries

**Example Logging Patterns:**

```javascript
// Success logging
logger.info({ userId, email }, "User registered successfully");

// Error logging
logger.error(
  {
    err,
    email,
    errorType: "SequelizeUniqueConstraintError",
  },
  "Registration failed - email already exists"
);

// Request logging
logger.info(
  {
    req: {
      id: req.id,
      method: req.method,
      url: req.url,
      body: req.body,
    },
  },
  "Incoming request"
);
```

## Testing

**What:** After implementing the logging changes, verify that:

1. Logs are properly structured and contain all necessary information
2. Logs are being collected by Loki
3. Grafana dashboards show the correct information
4. Log levels are appropriate for different environments

**Action Steps:**

1. Create test scenarios for different log levels
2. Verify log format and content
3. Test Loki log collection
4. Validate Grafana dashboards

## Documentation Update

**What:** Update documentation to include:

1. Logging conventions and best practices
2. Common log queries for debugging
3. How to access and use Grafana dashboards
4. Local development logging setup

This work plan provides a step-by-step guide to improve user registration error handling and implement a robust logging system. Follow these steps in order and test thoroughly after each step to ensure the changes are implemented correctly and effectively.
