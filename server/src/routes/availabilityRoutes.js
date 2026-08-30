const express = require('express');
const { getAvailability } = require('../controllers/availabilityController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, getAvailability);

module.exports = router;
