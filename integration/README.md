# V-KYC Recordings Portal - Integration Guide

This directory contains all necessary files and documentation to set up and run the integrated V-KYC Recordings Portal system using Docker Compose.

## System Components

The integrated system consists of:
- **Frontend:** A React application providing the user interface.
- **Backend:** A Node.js/Express API serving data and video files.
- **Database:** A PostgreSQL database storing video metadata.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Git:** For cloning the repository.
- **Docker Desktop:** Includes Docker Engine and Docker Compose.
  - [Install Docker Desktop](https://www.docker.com/products/docker-desktop)

## Setup and Execution Instructions

Follow these steps to get the V-KYC Recordings Portal up and running:

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/50101063/vkyc-recordings-portal.git
    cd vkyc-recordings-portal
    ```

2.  **Navigate to the Integration Directory:**
    ```bash
    cd integration/
    ```

3.  **Configure Environment Variables (Optional but Recommended):**
    Create a `.env` file in the `backend/` directory based on `backend/.env.example`.
    Create a `.env` file in the `frontend/` directory based on `frontend/.env.example`.
    *Note: For this initial setup, default values might be sufficient, but for production or specific environments, these should be properly configured.*

4.  **Build and Run the Services:**
    From within the `integration/` directory, execute the following command:
    ```bash
    docker-compose up --build
    ```
    This command will:
    -   Build the Docker images for the frontend, backend, and database services (if they don't exist or if `--build` is specified).
    -   Start all services as defined in `docker-compose.yml`.
    -   The database schema and seed data will be automatically applied on first run (as defined in `database/Dockerfile`).

5.  **Access the Application:**
    Once all services are running, the frontend application will be accessible via your web browser at:
    ```
    http://localhost:3000
    ```
    *Note: The port might vary if you have other applications running on port 3000 or if configured differently in `docker-compose.yml`.*

## Testing and Validation

After the application is running:

1.  **Verify Frontend Access:** Open `http://localhost:3000` in your browser. You should see the V-KYC Portal interface.
2.  **Verify Backend Connectivity:** The frontend should be able to make API calls to the backend. Look for a basic "health check" or "fetch data" functionality on the UI.
3.  **Verify Database Connectivity:** The backend should successfully connect to the PostgreSQL database. Initial data (from `seed_data.sql`) should be queryable.
4.  **Test Core Functionality:**
    -   Try searching for a LAN ID.
    -   Attempt to upload a sample `.csv` or `.txt` file for bulk requests (if implemented in the UI).
    -   Verify download functionality for single and bulk videos.

## Troubleshooting

-   **Port Conflicts:** If `docker-compose up` fails due to port conflicts, check if other applications are using ports `3000` (frontend), `5000` (backend), or `5432` (PostgreSQL). You can modify the `ports` mapping in `docker-compose.yml`.
-   **Docker Logs:** Use `docker-compose logs <service_name>` (e.g., `docker-compose logs backend`) to view logs for individual services and diagnose issues.
-   **NFS Mount:** Ensure the host machine running Docker has access to the LTF NFS server and that the NFS volume is correctly mounted into the backend container (this requires host-level configuration not covered by `docker-compose.yml` alone).

This guide provides the foundation for setting up the integrated system. Refer to the `frontend/README.md`, `backend/README.md`, and `database/README.md` for specific component details.