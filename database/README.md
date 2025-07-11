# V-KYC Recordings Portal - Database Documentation

## Overview

This directory contains the database schema definitions, migration scripts, and setup instructions for the V-KYC Recordings Portal. The database is built using PostgreSQL and stores metadata about V-KYC video recordings. The actual video files are stored on an LTF NFS server, and their paths are referenced within this database.

## Technologies

*   **Database:** PostgreSQL v16.x
*   **Migration Tool:** node-pg-migrate (recommended for managing schema changes)

## Database Schema

The primary table is `vkyc_recordings`, which stores metadata for each V-KYC recording.

### `vkyc_recordings` Table Structure

| Column Name     | Data Type    | Constraints                  | Description                                            |
| :-------------- | :----------- | :--------------------------- | :----------------------------------------------------- |
| `id`            | `SERIAL`     | `PRIMARY KEY`                | Unique identifier for the recording.                   |
| `lan`           | `VARCHAR(50)`| `NOT NULL`, `UNIQUE`, `INDEXED`| The Loan Account Number.                               |
| `vkyc_date`     | `TIMESTAMP`  | `NOT NULL`, `INDEXED`        | The date and time the V-KYC was approved.              |
| `status`        | `VARCHAR(20)`| `NOT NULL`, `INDEXED`        | Status of the V-KYC (e.g., 'APPROVED', 'REJECTED').    |
| `call_duration` | `INTERVAL`   |                              | Duration of the video call.                            |
| `nfs_file_path` | `TEXT`       | `NOT NULL`                   | The full path to the video file on the NFS server.     |
| `created_at`    | `TIMESTAMP`  | `DEFAULT NOW()`              | Timestamp of when the record was inserted.             |

## Setup and Execution Instructions

### 1. Install PostgreSQL

Ensure you have PostgreSQL v16.x or later installed and running on your system.
Refer to the official PostgreSQL documentation for installation instructions: [https://www.postgresql.org/download/](https://www.postgresql.org/download/)

### 2. Create a Database

Create a new database for the V-KYC Recordings Portal. You can do this via your PostgreSQL client (e.g., `psql`):

```bash
CREATE DATABASE vkyc_recordings_db;
```

### 3. Configure Database Connection

The backend application will connect to this database using environment variables. Ensure these are set up in your `.env` file (refer to `backend/.env.example`):

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=vkyc_recordings_db
```

### 4. Run Database Migrations

We recommend using `node-pg-migrate` to manage schema changes.
First, install `node-pg-migrate` globally or as a project dependency:

```bash
npm install -g node-pg-migrate # or npm install --save-dev node-pg-migrate
```

**To apply the initial schema:**

The initial schema is defined in `database/migrations/001_create_vkyc_recordings_table.sql`.
`node-pg-migrate` typically uses JavaScript files for migrations. For direct SQL execution, you would use a tool that can run SQL files, or adapt the SQL into a `node-pg-migrate` JS migration file.

**Example of a `node-pg-migrate` JS migration file (e.g., `migrations/001_create_vkyc_recordings_table.js`):**

```javascript
/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.createTable('vkyc_recordings', {
        id: 'id',
        lan: { type: 'varchar(50)', notNull: true, unique: true },
        vkyc_date: { type: 'timestamp', notNull: true },
        status: { type: 'varchar(20)', notNull: true },
        call_duration: { type: 'interval' },
        nfs_file_path: { type: 'text', notNull: true },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    });

    pgm.createIndex('vkyc_recordings', 'lan');
    pgm.createIndex('vkyc_recordings', 'vkyc_date');
    pgm.createIndex('vkyc_recordings', 'status');
};

exports.down = (pgm) => {
    pgm.dropTable('vkyc_recordings');
};
```

**To run migrations using `node-pg-migrate` (assuming a `migrations` directory and configured `database.json` or `DATABASE_URL`):**

```bash
node-pg-migrate up
```

Alternatively, you can manually execute the `database/schema.sql` file if you are not using `node-pg-migrate` for initial setup:

```bash
psql -U your_db_user -d vkyc_recordings_db -f database/schema.sql
```

### 5. Seed Initial Data (Optional)

For development or testing purposes, you can populate the database with sample data using the `seed_data.sql` file:

```bash
psql -U your_db_user -d vkyc_recordings_db -f database/seed_data.sql
```

## Data Ingestion

Please note that the database will be populated by a separate, scheduled data ingestion script. This script will scan the LTF NFS server, extract metadata from video files, and insert/update records in the `vkyc_recordings` table. This process is external to the V-KYC Recordings Portal application itself.
