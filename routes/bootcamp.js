const express = require('express');
const {
    getBootCamp, // Corrected typo
    getBootCamps, // Corrected typo
    createBootCamp,
    deleteBootCamp,
    updateBootCamp
} = require('../controllers/bootcamp');
const router = express.Router();

router.route('/').get(getBootCamps).post(createBootCamp);
router.route('/:id').get(getBootCamp).put(updateBootCamp).delete(deleteBootCamp);

module.exports = router;
