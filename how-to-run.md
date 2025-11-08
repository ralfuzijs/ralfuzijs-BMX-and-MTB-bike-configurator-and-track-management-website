# How to Run the BMX/MTB Website

This guide explains how to run both the frontend Vue.js application and the backend API server that powers the BMX/MTB website.

## Prerequisites

Before you begin, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or newer recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [MongoDB](https://www.mongodb.com/try/download/community) (local installation or access to MongoDB Atlas)

## Running the Backend API Server

The backend API server handles track data storage and retrieval.

1. Navigate to the API directory:
   ```bash
   cd map-tracks-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the database:
   - Make sure MongoDB is running on your system
   - On Windows, you may need to start the MongoDB server with administrator permissions:
     1. Open Command Prompt as Administrator
     2. Run the following command:
        ```bash
        net start MongoDB
        ```
   - The default connection string in `.env` is set to `mongodb://localhost:27017/bike_tracks_db`
   - If needed, modify the `.env` file with your MongoDB connection details

4. Start the development server:
   ```bash
   npm run dev
   ```
   
   This will start the server using nodemon, which automatically restarts when changes are detected.

   Alternatively, to run in production mode:
   ```bash
   npm start
   ```

5. The API server should now be running on port 5000 (default). You can test it by visiting:
   ```
   http://localhost:5000/api/tracks
   ```

## Running the Vue.js Frontend

The frontend provides the user interface for the website.

1. Navigate to the Vue project directory:
   ```bash
   cd vue-project
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. The Vue application should now be running. Open your browser and visit:
   ```
   http://localhost:5173
   ```
   
   The exact URL will be shown in your terminal after starting the development server.

## Accessing the Admin Page

To access the admin page where you can add new tracks:

1. Make sure both the backend API server and the Vue frontend are running
2. Navigate to the admin page in your browser:
   ```
   http://localhost:5173/admin
   ```

3. Use the form to add new tracks to the database:
   - Enter the track name
   - Select the track type (skatepark, pumptrack, bmx_track)
   - Add a description (optional)
   - Enter the location coordinates (longitude and latitude) - you can find these using Google Maps
   - Add an image URL (optional)
   - Click "Add Track"

## Building for Production

To build the Vue.js frontend for production:

1. Navigate to the Vue project directory:
   ```bash
   cd vue-project
   ```

2. Run the build command:
   ```bash
   npm run build
   ```

3. The built files will be in the `dist` directory, which can be deployed to a web server.

## Troubleshooting

- If you encounter connection issues with the API, make sure MongoDB is running and accessible
- Check that the ports (5000 for API, 5173 for Vue dev server) are not being used by other applications
- If changes to the frontend aren't reflecting, try clearing your browser cache

## Accessing the Website from Other Computers
```
http://84.237.199.230
```

Make sure the backend API server and the Vue frontend are running on your machine. The port forwarding setup ensures that requests to your public IP are routed to your local server.

It works because I port fowarded my website.