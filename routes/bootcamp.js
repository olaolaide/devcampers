const express = require('express');
const {
    getBootCamp, // Corrected typo
    getBootCamps, // Corrected typo
    createBootCamp,
    deleteBootCamp,
    updateBootCamp,
    getBootCampsInRadius,
    bootcampPhotoUpload
} = require('../controllers/bootcamp');

// Include other resource routers
const courseRouter = require('./courses')
const router = express.Router();

// Reroute into other resource routers
router.use('/:bootcampId/courses', courseRouter)

router.route('/radius/:zipcode/:distance').get(getBootCampsInRadius)
router.route('/').get(getBootCamps).post(createBootCamp);
router.route('/:id').get(getBootCamp).put(updateBootCamp).delete(deleteBootCamp);
router.route('/:id/photo').put(bootcampPhotoUpload)


module.exports = router;
