# V-KYC Recordings Portal - Backend

This directory contains the backend application for the V-KYC Recordings Portal, built with Node.js and Express.js. It serves as the API layer, handling business logic, data retrieval from PostgreSQL, and secure serving of video files from the LTF NFS server.

## Table of Contents

1.  [Features](#features)
2.  [Technology Stack](#technology-stack)
3.  [Setup Instructions](#setup-instructions)
    *   [Prerequisites](#prerequisites)
    *   [Installation](#installation)
    *   [Environment Variables](#environment-variables)
    *   [Database Setup](#database-setup)
    *   [Running the Application](#running-the-application)
4.  [API Endpoints](#api-endpoints)
5.  [Folder Structure](#folder-structure)
6.  [Contributing](#contributing)
7.  [License](#license)

## Features

*   Secure authentication via OAuth 2.0 / OpenID Connect (OIDC) with a corporate Identity Provider (IdP).
*   API endpoints for searching, filtering, and retrieving V-KYC recording metadata.
*   Ability to download individual V-KYC video recordings.
*   Support for bulk requests via CSV/TXT file upload (up to 50 LAN IDs).
*   Efficient streaming of video files from NFS.
*   On-the-fly ZIP generation for bulk downloads to minimize disk usage.
*   Pagination for search results.

## Technology Stack

*   **Runtime**: Node.js v20.x (LTS)
*   **Web Framework**: Express.js v4.x
*   **Database Client**: `pg` (for PostgreSQL)
*   **File Uploads**: `multer`
*   **Archive Generation**: `archiver`
*   **Authentication**: `passport.js` (with OIDC strategy)
*   **Environment Variables**: `dotenv`
*   **CSV Parsing**: `csv-parser`

## Setup Instructions

### Prerequisites

Before you begin, ensure you have the following installed:

*   Node.js v20.x or higher
*   npm (comes with Node.js)
*   PostgreSQL v16.x database instance
*   Access to the LTF NFS server (where video recordings are stored) from the machine running this backend. The NFS share path must be accessible.
*   A corporate Identity Provider (IdP) configured for OAuth 2.0 / OIDC, with client credentials for this application.

### Installation

1.  Navigate to the `backend/` directory:
    ```bash
    cd backend/
    ```
2.  Install the required Node.js packages:
    ```bash
    npm install
    ```

### Environment Variables

Create a `.env` file in the `backend/` directory by copying `.env.example` and filling in the details:

```bash
cp .env.example .env
```

Edit the `.env` file with your specific configurations:

*   `PORT=3000` (The port the Express server will listen on)
*   `DATABASE_URL="postgresql://user:password@host:port/database"` (Your PostgreSQL connection string)
*   `NFS_MOUNT_PATH="/mnt/nfs/vkyc_recordings"` (The absolute path to the mounted NFS share on the server)
*   `OIDC_ISSUER="https://your-idp.com/oauth2"` (Your OIDC Issuer URL)
*   `OIDC_CLIENT_ID="your_client_id"` (Client ID for your application registered with the IdP)
*   `OIDC_CLIENT_SECRET="your_client_secret"` (Client Secret for your application)
*   `OIDC_REDIRECT_URI="http://localhost:3000/auth/callback"` (The redirect URI registered with your IdP)
*   `SESSION_SECRET="a_very_secret_key"` (A strong, random string for session encryption)

### Database Setup

Ensure your PostgreSQL database is running. You will need to create the `vkyc_recordings` table as defined in the Solution Architect's `architecture/3_data_flow_and_apis.md`.

A sample SQL schema for the `vkyc_recordings` table:

```sql
CREATE TABLE vkyc_recordings (
    id SERIAL PRIMARY KEY,
    lan VARCHAR(50) NOT NULL UNIQUE,
    vkyc_date TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL,
    call_duration INTERVAL,
    nfs_file_path TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_lan ON vkyc_recordings (lan);
CREATE INDEX idx_vkyc_date ON vkyc_recordings (vkyc_date);
CREATE INDEX idx_status ON vkyc_recordings (status);
```

**Note**: The database will be populated by a separate data ingestion process that scans the NFS server. This backend application only reads from it.

### Running the Application

To start the backend server:

```bash
npm start
```

The server will typically run on `http://localhost:3000` (or the port specified in your `.env` file).

## API Endpoints

Refer to `routes/` and `controllers/` for detailed API endpoint definitions. Key endpoints include:

*   `POST /api/auth/login`: Initiate OIDC login flow.
*   `GET /api/videos`: Get paginated and filtered video records.
*   `GET /api/videos/search?lan=<LAN_ID>`: Search for a specific video by LAN.
*   `GET /api/videos/download/:lan`: Download a single video file.
*   `POST /api/videos/bulk-request`: Upload CSV/TXT for bulk download request.
*   `GET /api/videos/bulk-download/:requestId`: Download a ZIP file of bulk requested videos.

## Folder Structure

```
backend/
├── controllers/
│   ├── authController.js
│   └── videoController.js
├── middleware/
│   └── authMiddleware.js
├── routes/
│   ├── authRoutes.js
│   └── videoRoutes.js
├── services/
│   └── videoService.js
├── utils/
│   └── db.js
├── .env.example
├── package.json
├── server.js
└── README.md
```

## Contributing

Please adhere to the developer guidelines outlined in `architecture/4_developer_guidelines.md`.

## License

[Specify your license here, e.g., MIT, Apache 2.0]
