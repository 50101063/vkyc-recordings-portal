# V-KYC Recordings Portal - Backend

This directory contains the backend application for the V-KYC Recordings Portal, built using Node.js and Express.js. It serves as the API layer, handling business logic, data retrieval from PostgreSQL, and secure streaming of video files from the NFS share.

## Technologies Used

*   **Node.js**: v20.x (LTS)
*   **Express.js**: v4.x
*   **PostgreSQL**: Database client for interacting with the metadata database.
*   **Passport.js**: For OAuth 2.0 / OpenID Connect authentication.
*   **Multer**: Middleware for handling `multipart/form-data`, primarily for file uploads.
*   **Archiver**: For creating `.zip` archives on-the-fly for bulk downloads.
*   **dotenv**: For loading environment variables from a `.env` file.
*   **csv-parser**: For parsing uploaded CSV/TXT files containing LAN IDs.

## Setup and Execution Instructions

### Prerequisites

*   Node.js v20.x installed.
*   npm (Node Package Manager) installed.
*   Access to a PostgreSQL database instance with the `vkyc_recordings` table populated (refer to `architecture/3_data_flow_and_apis.md` for schema).
*   Access to the LTF NFS server where video recordings are stored (the backend server must have this mounted).
*   Corporate Identity Provider (IdP) configured for OAuth 2.0 / OIDC.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/50101063/vkyc-recordings-portal.git
    cd vkyc-recordings-portal/backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Configuration

Create a `.env` file in the `backend/` directory with the following environment variables:

```dotenv
PORT=3001
DATABASE_URL="postgresql://user:password@host:port/database"
OAUTH_CLIENT_ID="your_oauth_client_id"
OAUTH_CLIENT_SECRET="your_oauth_client_secret"
OAUTH_AUTHORIZATION_URL="https://idp.example.com/oauth/authorize"
OAUTH_TOKEN_URL="https://idp.example.com/oauth/token"
OAUTH_USER_PROFILE_URL="https://idp.example.com/oauth/userinfo" # Or similar endpoint to get user details
OAUTH_CALLBACK_URL="http://localhost:3001/api/auth/callback"
SESSION_SECRET="a_very_secret_key_for_express_session"
NFS_MOUNT_PATH="/mnt/nfs/vkyc_recordings" # Path where NFS is mounted on the backend server
```

**Note:** Ensure `OAUTH_CALLBACK_URL` matches the redirect URI configured in your IdP. For production, `http://localhost:3001` should be replaced with your actual domain.

### Running the Application

To start the backend server:

```bash
npm start
```

The server will typically run on `http://localhost:3001` (or the `PORT` specified in your `.env` file).

## API Endpoints

Refer to `architecture/3_data_flow_and_apis.md` for a detailed API specification.

## Project Structure

```
backend/
├── config/             # Configuration files
├── controllers/        # Handles request/response logic
├── middleware/         # Express middleware (e.g., authentication)
├── routes/             # API route definitions
├── services/           # Core business logic and database interactions
├── utils/              # Utility functions (e.g., database connection)
├── .env.example        # Example environment variables
├── package.json        # Project dependencies and scripts
├── package-lock.json
├── server.js           # Main application entry point
└── README.md           # This file
```
