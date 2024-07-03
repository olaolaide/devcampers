const ErrorResponse = require('../utils/errorResponse');
const BootCamp = require('../models/Bootcamp');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder')

// Get all bootcamps
// @access Public
exports.getBootCamps = asyncHandler(async (req, res) => {
    const bootcamps = await BootCamp.find();
    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    });
});

// Get single bootcamp by ID
exports.getBootCamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await BootCamp.findById(req.params.id);
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({
        success: true,
        data: bootcamp
    });
});

// Create a new bootcamp
exports.createBootCamp = asyncHandler(async (req, res) => {
    const bootcamp = await BootCamp.create(req.body);
    res.status(201).json({
        success: true,
        data: bootcamp
    });
});

// Update bootcamp by ID
exports.updateBootCamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await BootCamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!bootcamp) {
        return next(new ErrorResponse('Bootcamp not found', 404));
    }
    res.status(200).json({
        success: true,
        data: bootcamp
    });
});

// Delete bootcamp by ID
exports.deleteBootCamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await BootCamp.findByIdAndDelete(req.params.id);
    if (!bootcamp) {
        return next(new ErrorResponse('Bootcamp not found', 404));
    }
    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc Get Bootcamps Within A Radius
exports.getBootCampsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params;

    // Get latitude and longitude from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // Calculate radius using radians
    // Divide distance by radius of Earth
    //  Radius = 3,963 miles / 6,378 km
    const radius = distance / 3963;

    const bootcamps = await BootCamp.find({
        location: {
            $geoWithin: {
                $centerSphere: [[lng, lat], radius]
            }
        }
    });

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    });
});