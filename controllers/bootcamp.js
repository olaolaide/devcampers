const ErrorResponse = require('../utils/errorResponse');
const BootCamp = require('../models/Bootcamp');
const Course = require('../models/Course');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder')
const path = require('path')
// Get all bootcamps
// @access Public
exports.getBootCamps = asyncHandler(async (req, res) => {
    let query;

    // Copy req.query
    const reqQuery = {...req.query};

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = BootCamp.find(JSON.parse(queryStr)).populate('courses');

    // Select Fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await BootCamp.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const bootcamps = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        pagination,
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
    const bootcamp = await BootCamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse('Bootcamp not found', 404));
    }

    // Delete related courses
    await Course.deleteMany({bootcamp: req.params.id});

    // Delete the bootcamp
    await bootcamp.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc Get Bootcamps Within A Radius
exports.getBootCampsInRadius = asyncHandler(async (req, res, next) => {
    const {zipcode, distance} = req.params;

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


// @desc upload photo for bootcamp
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    const bootcamp = await BootCamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse('Bootcamp not found', 404));
    }

    if (!req.files) {
        return next(new ErrorResponse('Please upload a file', 400));
    }

    const file = req.files.file;
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse('Please upload an image', 400));
    }

    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400));
    }

    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

    // Upload file
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.error(err);
            return next(new ErrorResponse('Problem with file upload', 500));
        }
        await BootCamp.findByIdAndUpdate(req.params.id, {
            photo: file.name
        });

        res.status(200).json({
            success: true,
            data: file.name
        });
    });
});
