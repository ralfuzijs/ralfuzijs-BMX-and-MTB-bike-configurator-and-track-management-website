# Project Updates

- **No date**
  - Fixed map marker display issues on mobile devices
  - Optimized database queries for track listings
  - Updated dependencies to latest versions

  - Added dark mode toggle functionality
  - Improved responsive design for tablets and mobile phones
  - Fixed styling issues in the admin dashboard

  - Integrated Leaflet map for displaying tracks
  - Added custom markers for different track types
  - Implemented geolocation functionality

  - Created admin page for managing tracks
  - Added CRUD operations for track data
  - Implemented form validation for track submissions

  - Set up Vue.js frontend with Vite
  - Developed backend API with Express.js and MongoDB
  - Configured geospatial indexing for track locations
  - Added basic unit tests using Vitest

- **10.04.2025**
  - Added login authentication to admin page
  - Implemented secure token-based session management
  - Added user credentials validation 

- **11.04.2025**
  - Designed and implemented MongoDB user schema
  - Added comprehensive JWT-based authentication system
  - Created user registration and login API endpoints
  - Set up secure password hashing with bcrypt
  - Implemented user profile and account management
  - Added login activity tracking with IP and timestamp logging
  - Created role-based authorization middleware
  - Connected user authentication to frontend components

- **20.04.2025**
  - Changed logout button to redirect to user login page instead of main page
  - Updated admin login page styling to match user login page for consistent UI
  - Standardized navigation elements across the application
  - Implemented real database authentication for user login
  - Connected login form with backend API for credential verification
  - Added proper error handling for invalid login attempts
  - Updated registration process to store user data in database
  - Implemented secure token storage for authenticated sessions

- **21.04.2025**
  - Configured port forwarding to enable WAN access to the website
  - Website can now be accessed globally from any PC around the world
  - Implemented necessary security measures for public access
  - Tested cross-network connectivity and optimized response times

- **29.04.2025**
  - Created "Coming Soon" pages for upcoming features:
    - Added styled placeholder for Bike Size Calculator (65% progress)
    - Added styled placeholder for Bike Configurator (40% progress)
  - Implemented consistent red color theme for placeholder pages
  - Added proper router configuration for new feature pages
  - Updated home page cards to link to new placeholder pages
  - Made placeholder content concise with clear progress indicators
  - Created responsive layout for mobile and desktop views

- **02.05.2025**
  - Fixed loading screen persistence issue on map of tracks page
  - Corrected Leaflet attribution control configuration error
  - Added failsafe timeout to ensure loading states reset properly
  - Enhanced map UI with improved track type indicators
  - Optimized sidebar toggle functionality for better user experience
  - Added better error handling for track loading process
  - Improved console logging for debugging purposes

- **16.05.2025**
  - Migrated database from MongoDB to SQLite for simpler deployment
  - Updated all controller functions to work with Sequelize ORM
  - Created data transformation layer to maintain API compatibility
  - Fixed track display in map and admin panel to work with new database
  - Implemented JWT authentication to work with SQLite database
  - Added better error handling and logging throughout the application
  - Created utility functions for token generation and validation
  - Successfully tested all CRUD operations with the new database
  - Fixed coordinate handling for proper map marker placement

- **06.10.2025**
  - Added 3 bike types to Bike Size Calculator: MTB, BMX Freestyle, and BMX Racing
  - Updated user profile to display bike type on saved calculations
  - Implemented account deletion button in user profile settings
  - Added confirmation dialog for account deletion to prevent accidental deletions
  - Account deletion now properly removes user data from database

- **08.10.2025**
  - Fixed admin user deletion functionality in user management panel
  - Resolved foreign key constraint errors when deleting users with related data
  - **Implemented comprehensive Admin Settings page with three main sections:**
    - **Account Tab**: View role, email, creation date, last login; Update username
    - **Security Tab**: Change password with validation (current + new + confirm); View login history (last 10 logins with timestamp, IP address, and user agent)
    - **Preferences Tab**: Set default view on login, theme preference (light/dark mode with instant apply), email notification toggle
  - Created admin-settings-view.vue component with tabbed interface
  - Updated backend user profile endpoint to return login history
  - Added getUserProfile and updateUserProfile API methods
  - Implemented password change with current password verification
  - Added preferences storage in localStorage with persistence
  - Created responsive design with mobile-friendly layout
  - Added comprehensive form validation and error handling
  - Implemented loading states and success/error messages for all operations
