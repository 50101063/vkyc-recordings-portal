const { Pool } = require('pg');
const fs = require('fs');
const { parse } = require('csv-parse');
const config = require('../config');

const pool = new Pool({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
});

// Function to get filtered, paginated, and sorted video metadata
exports.getFilteredVideos = async ({ page, limit, sortBy, sortOrder, search, month, year }) => {
    const offset = (page - 1) * limit;
    let query = `SELECT id, lan, vkyc_date, status, call_duration FROM vkyc_recordings WHERE status = 'APPROVED'`;
    const params = [];
    let paramIndex = 1;

    if (search) {
        query += ` AND lan ILIKE $${paramIndex++}`; // Case-insensitive search by LAN
        params.push(`%${search}%`);
    }
    if (month) {
        query += ` AND EXTRACT(MONTH FROM vkyc_date) = $${paramIndex++}`; // Filter by month
        params.push(month);
    }
    if (year) {
        query += ` AND EXTRACT(YEAR FROM vkyc_date) = $${paramIndex++}`; // Filter by year
        params.push(year);
    }

    // Add sorting
    query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;

    // Add pagination
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const client = await pool.connect();
    try {
        const result = await client.query(query, params);
        // To get total count for pagination, a separate COUNT query is needed
        const countQuery = `SELECT COUNT(*) FROM vkyc_recordings WHERE status = 'APPROVED'`;
        const countResult = await client.query(countQuery, params.slice(0, params.length - 2)); // Exclude limit/offset for count
        const total = parseInt(countResult.rows[0].count, 10);

        return { total, page, limit, videos: result.rows };
    } finally {
        client.release();
    }
};

// Function to get video metadata by a single LAN ID
exports.getVideoMetadataByLan = async (lan) => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `SELECT id, lan, vkyc_date, status, call_duration, nfs_file_path FROM vkyc_recordings WHERE lan = $1 AND status = 'APPROVED'`,
            [lan]
        );
        return result.rows[0];
    } finally {
        client.release();
    }
};

// Function to get video metadata for multiple LAN IDs
exports.getVideosByLanIds = async (lanIds) => {
    if (!Array.isArray(lanIds) || lanIds.length === 0) {
        return [];
    }
    const client = await pool.connect();
    try {
        // Using UNNEST to query for multiple IDs efficiently
        const query = `SELECT id, lan, vkyc_date, status, call_duration, nfs_file_path FROM vkyc_recordings WHERE lan = ANY($1::varchar[]) AND status = 'APPROVED'`;
        const result = await client.query(query, [lanIds]);
        return result.rows;
    } finally {
        client.release();
    }
};

// Function to parse LAN IDs from an uploaded file (CSV/TXT)
exports.parseLanIdsFromFile = (filePath) => {
    return new Promise((resolve, reject) => {
        const lanIds = [];
        fs.createReadStream(filePath)
            .pipe(parse({ columns: false, trim: true, skip_empty_lines: true }))
            .on('data', (row) => {
                // Assuming each row contains one LAN ID. If it's CSV, it might be row[0]
                if (row[0]) {
                    lanIds.push(row[0]);
                }
            })
            .on('end', () => {
                resolve(lanIds);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
};
