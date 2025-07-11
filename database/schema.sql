-- database/schema.sql

-- Table: vkyc_recordings
CREATE TABLE IF NOT EXISTS vkyc_recordings (
    id SERIAL PRIMARY KEY,
    lan VARCHAR(50) NOT NULL UNIQUE,
    vkyc_date TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL,
    call_duration INTERVAL,
    nfs_file_path TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vkyc_recordings_lan ON vkyc_recordings (lan);
CREATE INDEX IF NOT EXISTS idx_vkyc_recordings_vkyc_date ON vkyc_recordings (vkyc_date);
CREATE INDEX IF NOT EXISTS idx_vkyc_recordings_status ON vkyc_recordings (status);
