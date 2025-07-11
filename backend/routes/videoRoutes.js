const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Temporary directory for file uploads

// All video routes require authentication
router.use(isAuthenticated);

// GET /api/videos - Get paginated, sorted, filtered list of records
router.get('/', videoController.getVideos);

// GET /api/videos/search - Search for a specific record by LAN
router.get('/search', videoController.searchVideoByLan);

// GET /api/videos/download/:lan - Download a single video file
router.get('/download/:lan', videoController.downloadVideo);

// POST /api/videos/bulk-request - Upload a .csv/.txt file of LANs for bulk processing
router.post('/bulk-request', upload.single('file'), videoController.bulkRequest);

// GET /api/videos/bulk-download/:requestId - Download a zip archive of videos from a bulk request
router.get('/bulk-download/:requestId', videoController.bulkDownload);

module.exports = router;
