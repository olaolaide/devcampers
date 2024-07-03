const express = require('express');
const {
    getBootCamp, // Corrected typo
    getBootCamps, // Corrected typo
    createBootCamp,
    deleteBootCamp,
    updateBootCamp,
    getBootCampsInRadius
} = require('../controllers/bootcamp');
const router = express.Router();

router.route('/radius/:zipcode/:distance').get(getBootCampsInRadius)
router.route('/').get(getBootCamps).post(createBootCamp);
router.route('/:id').get(getBootCamp).put(updateBootCamp).delete(deleteBootCamp);


module.exports = router;
