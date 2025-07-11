const videoService = require('../services/videoService');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const archiver = require('archiver');

// Helper to send errors
const sendError = (res, statusCode, message, details = null) => {
    res.status(statusCode).json({ message, details });
};

// GET /api/videos - Get paginated, sorted, filtered list of records
exports.getVideos = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, sortBy = 'vkyc_date', sortOrder = 'desc', search = '', date, month, year } = req.query;
        const videos = await videoService.getFilteredVideos({ page, limit, sortBy, sortOrder, search, date, month, year });
        res.json(videos);
    } catch (error) {
        next(error);
    }
};

// GET /api/videos/search - Search for a specific record by LAN
exports.searchVideoByLan = async (req, res, next) => {
    try {
        const { lan } = req.query;
        if (!lan) {
            return sendError(res, 400, 'LAN parameter is required.');
        }
        const video = await videoService.getVideoByLan(lan);
        if (!video) {
            return sendError(res, 404, 'Video not found for the given LAN.');
        }
        res.json(video);
    } catch (error) {
        next(error);
    }
};

// GET /api/videos/download/:lan - Download a single video file
exports.downloadVideo = async (req, res, next) => {
    try {
        const { lan } = req.params;
        if (!lan) {
            return sendError(res, 400, 'LAN parameter is required.');
        }

        const video = await videoService.getVideoByLan(lan);
        if (!video || !video.nfs_file_path) {
            return sendError(res, 404, 'Video file path not found.');
        }

        const filePath = video.nfs_file_path;

        // Basic check if file exists and is readable
        if (!fs.existsSync(filePath)) {
            return sendError(res, 404, 'File not found on NFS.');
        }

        // Set headers for download
        res.setHeader('Content-Type', 'video/mp4'); // Assuming MP4, adjust if needed
        res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);

        // Stream the file
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

        fileStream.on('error', (err) => {
            console.error('File streaming error:', err);
            sendError(res, 500, 'Error streaming video file.', err.message);
        });

    } catch (error) {
        next(error);
    }
};

// POST /api/videos/bulk-request - Upload a .csv/.txt file of LANs for bulk processing
exports.bulkRequest = async (req, res, next) => {
    try {
        if (!req.file) {
            return sendError(res, 400, 'No file uploaded.');
        }

        const lanIds = [];
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (row) => {
                // Assuming LAN ID is in a column named 'LAN' or 'LanID'
                const lan = row.LAN || row.LanID || Object.values(row)[0]; // Fallback to first column value
                if (lan) {
                    lanIds.push(lan.trim());
                }
            })
            .on('end', async () => {
                // Clean up the uploaded file
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Error deleting uploaded file:', err);
                });

                if (lanIds.length < 2 || lanIds.length > 50) {
                    return sendError(res, 400, `File must contain between 2 and 50 LAN IDs. Found ${lanIds.length}.`);
                }

                try {
                    const bulkRequestResult = await videoService.processBulkRequest(lanIds);
                    // Store bulkRequestResult in a temporary cache/DB for later retrieval by requestId
                    // For now, we'll just return it directly or a simplified response.
                    res.status(202).json({ message: 'Bulk request received and processing', data: bulkRequestResult });
                } catch (serviceError) {
                    next(serviceError);
                }
            })
            .on('error', (err) => {
                // Clean up the uploaded file on error
                fs.unlink(req.file.path, (unlinkErr) => {
                    if (unlinkErr) console.error('Error deleting uploaded file after CSV error:', unlinkErr);
                });
                sendError(res, 400, 'Error processing CSV/TXT file.', err.message);
            });

    } catch (error) {
        next(error);
    }
};

// GET /api/videos/bulk-download/:requestId - Download a zip archive of videos from a bulk request
exports.bulkDownload = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        // In a real app, retrieve LANs from a temporary store using requestId
        // For this example, let's assume we have a list of LANs to download
        // This part needs to be integrated with how `processBulkRequest` stores results.

        // Placeholder: Assuming `requestId` directly maps to a list of LANs or a processed result object
        // For a real scenario, you'd fetch this from a temporary cache or DB.
        const bulkRequestData = await videoService.getBulkRequestData(requestId); // This service method needs implementation

        if (!bulkRequestData || !bulkRequestData.lanIds || bulkRequestData.lanIds.length === 0) {
            return sendError(res, 404, 'Bulk request data not found or no LANs to download.');
        }

        const filesToArchive = [];
        for (const lan of bulkRequestData.lanIds) {
            const video = await videoService.getVideoByLan(lan);
            if (video && fs.existsSync(video.nfs_file_path)) {
                filesToArchive.push({
                    path: video.nfs_file_path,
                    name: `${lan}_${path.basename(video.nfs_file_path)}` // Naming convention for files in zip
                });
            }
        }

        if (filesToArchive.length === 0) {
            return sendError(res, 404, 'No valid video files found for the bulk request.');
        }

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="vkyc_recordings_bulk_${requestId}.zip"`);

        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });

        archive.on('warning', (err) => {
            if (err.code === 'ENOENT') {
                console.warn('Archiver warning:', err.message);
            } else {
                throw err;
            }
        });

        archive.on('error', (err) => {
            next(err);
        });

        archive.pipe(res);

        for (const file of filesToArchive) {
            archive.file(file.path, { name: file.name });
        }

        archive.finalize();

    } catch (error) {
        next(error);
    }
};
